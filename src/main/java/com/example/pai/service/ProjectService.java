package com.example.pai.service;


import com.example.pai.controller.project.dto.ProjectDto;
import com.example.pai.dao.model.Project;
import com.example.pai.dao.model.ProjectAssignment;
import com.example.pai.dao.repository.ProjectRepository;
import com.example.pai.dao.repository.ProjectAssignmentRepository;
import com.example.pai.dao.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getActiveProjects() {
        return projectRepository.findByStatus(Project.ProjectStatus.ACTIVE).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getInactiveProjects() {
        return projectRepository.findByStatus(Project.ProjectStatus.INACTIVE).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getProjectsForUser(UUID userId) {
        return projectAssignmentRepository.findByUserId(userId).stream()
                .map(assignment -> assignment.getProject())
                .filter(project -> project.getStatus() == Project.ProjectStatus.ACTIVE)
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ProjectDto.ProjectResponse> getProjectById(UUID id) {
        return projectRepository.findById(id)
                .map(this::mapToProjectResponse);
    }

    @Transactional
    public ProjectDto.ProjectResponse createProject(ProjectDto.ProjectRequest projectRequest) {
        Project project = new Project();
        project.setName(projectRequest.getName());
        project.setDescription(projectRequest.getDescription());

        Project savedProject = projectRepository.save(project);
        return mapToProjectResponse(savedProject);
    }

    @Transactional
    public Optional<ProjectDto.ProjectResponse> updateProject(UUID id, ProjectDto.ProjectUpdateRequest projectUpdateRequest) {
        return projectRepository.findById(id)
                .map(project -> {
                    if (projectUpdateRequest.getName() != null) {
                        project.setName(projectUpdateRequest.getName());
                    }

                    if (projectUpdateRequest.getDescription() != null) {
                        project.setDescription(projectUpdateRequest.getDescription());
                    }

                    if (projectUpdateRequest.getStatus() != null) {
                        try {
                            project.setStatus(Project.ProjectStatus.valueOf(projectUpdateRequest.getStatus().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // Invalid status, ignore
                        }
                    }

                    Project updatedProject = projectRepository.save(project);
                    return mapToProjectResponse(updatedProject);
                });
    }

    @Transactional
    public boolean deleteProject(UUID id) {
        return projectRepository.findById(id)
                .map(project -> {
                    // First delete all tasks associated with this project
                    taskService.deleteTasksByProjectId(id);
                    // Then delete the project
                    projectRepository.delete(project);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public boolean assignUserToProject(UUID projectId, UUID userId) {
        if (projectAssignmentRepository.existsByProjectIdAndUserId(projectId, userId)) {
            return false;
        }

        return projectRepository.findById(projectId)
                .flatMap(project -> userRepository.findById(userId)
                        .filter(user -> "DEVELOPER".equals(user.getRole().getName()) || 
                                       "DEVOPS".equals(user.getRole().getName()))
                        .map(user -> {
                            ProjectAssignment assignment = new ProjectAssignment();
                            assignment.setProject(project);
                            assignment.setUser(user);
                            projectAssignmentRepository.save(assignment);
                            return true;
                        }))
                .orElse(false);
    }

    @Transactional
    public boolean removeUserFromProject(UUID projectId, UUID userId) {
        projectAssignmentRepository.deleteByProjectIdAndUserId(projectId, userId);
        return true;
    }


    @Transactional
    public boolean setProjectStatus(UUID id, String status) {
        return projectRepository.findById(id)
                .map(project -> {
                    try {
                        project.setStatus(Project.ProjectStatus.valueOf(status.toUpperCase()));
                        projectRepository.save(project);
                        return true;
                    } catch (IllegalArgumentException e) {
                        return false;
                    }
                })
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<ProjectDto.AssignedUser> getAssignedUsers(UUID projectId) {
        return projectAssignmentRepository.findByProjectId(projectId).stream()
                .map(assignment -> ProjectDto.AssignedUser.builder()
                        .id(assignment.getUser().getId())
                        .name(assignment.getUser().getName())
                        .email(assignment.getUser().getEmail())
                        .role(assignment.getUser().getRole().getName())
                        .assignmentTimestamp(assignment.getCreationTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getProjectsByStatus(String status) {
        try {
            Project.ProjectStatus projectStatus = Project.ProjectStatus.valueOf(status.toUpperCase());
            return projectRepository.findByStatus(projectStatus).stream()
                    .map(this::mapToProjectResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    private ProjectDto.ProjectResponse mapToProjectResponse(Project project) {
        List<ProjectDto.AssignedUser> assignedUsers = getAssignedUsers(project.getId());
        
        ProjectDto.ProjectResponse.ProjectResponseBuilder builder = ProjectDto.ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus() != null ? project.getStatus().name() : "ACTIVE")
                .creationTimestamp(project.getCreationTimestamp())
                .modificationTimestamp(project.getModificationTimestamp())
                .assignedUsers(assignedUsers)
                .memberCount(assignedUsers.size());
        
        if (project.getOwner() != null) {
            builder.ownerId(project.getOwner().getId())
                   .ownerName(project.getOwner().getName());
        }
        
        return builder.build();
    }
}