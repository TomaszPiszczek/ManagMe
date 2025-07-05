package com.example.pai.controller.project;

import com.example.pai.controller.project.dto.ProjectDto;
import com.example.pai.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/active")
    public ResponseEntity<List<ProjectDto.ProjectResponse>> getActiveProjects() {
        return ResponseEntity.ok(projectService.getActiveProjects());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<ProjectDto.ProjectResponse>> getInactiveProjects() {
        return ResponseEntity.ok(projectService.getInactiveProjects());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDto.ProjectResponse>> getProjectsForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(projectService.getProjectsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto.ProjectResponse> getProjectById(@PathVariable UUID id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectDto.ProjectResponse> createProject(@RequestBody ProjectDto.ProjectRequest projectRequest) {
        return new ResponseEntity<>(projectService.createProject(projectRequest), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto.ProjectResponse> updateProject(
            @PathVariable UUID id,
            @RequestBody ProjectDto.ProjectUpdateRequest projectUpdateRequest) {
        return projectService.updateProject(id, projectUpdateRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        if (projectService.deleteProject(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{projectId}/assign/{userId}")
    public ResponseEntity<Void> assignUserToProject(@PathVariable UUID projectId, @PathVariable UUID userId) {
        if (projectService.assignUserToProject(projectId, userId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{projectId}/assign/{userId}")
    public ResponseEntity<Void> removeUserFromProject(@PathVariable UUID projectId, @PathVariable UUID userId) {
        if (projectService.removeUserFromProject(projectId, userId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Void> setProjectStatus(@PathVariable UUID id, @PathVariable String status) {
        if (projectService.setProjectStatus(id, status)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/assigned-users")
    public ResponseEntity<List<ProjectDto.AssignedUser>> getAssignedUsers(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getAssignedUsers(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectDto.ProjectResponse>> getProjectsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(projectService.getProjectsByStatus(status));
    }
}