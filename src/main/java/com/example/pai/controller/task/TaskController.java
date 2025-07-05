package com.example.pai.controller.task;

import com.example.pai.controller.task.dto.TaskDto;
import com.example.pai.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto.TaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto.TaskResponse> getTaskById(@PathVariable UUID id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDto.TaskResponse>> getTasksByProjectId(@PathVariable UUID projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @GetMapping("/assigned/{assignedUserId}")
    public ResponseEntity<List<TaskDto.TaskResponse>> getTasksByAssignedUser(@PathVariable UUID assignedUserId) {
        return ResponseEntity.ok(taskService.getTasksByAssignedUser(assignedUserId));
    }

    @PostMapping
    public ResponseEntity<TaskDto.TaskResponse> createTask(@RequestBody TaskDto.TaskRequest taskRequest) {
        return new ResponseEntity<>(taskService.createTask(taskRequest), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.TaskResponse> updateTask(
            @PathVariable UUID id,
            @RequestBody TaskDto.TaskUpdateRequest taskUpdateRequest) {
        return taskService.updateTask(id, taskUpdateRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        if (taskService.deleteTask(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/assign/{userId}")
    public ResponseEntity<TaskDto.TaskResponse> assignTask(@PathVariable UUID id, @PathVariable UUID userId) {
        return taskService.assignTask(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<TaskDto.TaskResponse> changeTaskStatus(@PathVariable UUID id, @PathVariable String status) {
        return taskService.changeTaskStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}/start")
    public ResponseEntity<TaskDto.TaskResponse> startTask(@PathVariable UUID id) {
        return taskService.startTask(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/finish")
    public ResponseEntity<TaskDto.TaskResponse> finishTask(@PathVariable UUID id) {
        return taskService.finishTask(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TaskDto.TaskResponse> approveTask(@PathVariable UUID id) {
        return taskService.approveTask(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TaskDto.TaskResponse> rejectTask(@PathVariable UUID id) {
        return taskService.rejectTask(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/mark-notes-read")
    public ResponseEntity<TaskDto.TaskResponse> markNotesAsRead(@PathVariable UUID id) {
        return taskService.markNotesAsRead(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}