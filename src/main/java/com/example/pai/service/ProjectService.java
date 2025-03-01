package com.example.pai.service;


import com.example.pai.controller.project.dto.ProjectDto;
import com.example.pai.dao.model.Project;
import com.example.pai.dao.reposirtory.ProjectRepository;
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

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
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

                    Project updatedProject = projectRepository.save(project);
                    return mapToProjectResponse(updatedProject);
                });
    }

    @Transactional
    public boolean deleteProject(UUID id) {
        return projectRepository.findById(id)
                .map(project -> {
                    projectRepository.delete(project);
                    return true;
                })
                .orElse(false);
    }

    private ProjectDto.ProjectResponse mapToProjectResponse(Project project) {
        return ProjectDto.ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .creationTimestamp(project.getCreationTimestamp())
                .modificationTimestamp(project.getModificationTimestamp())
                .build();
    }
}