package com.example.pai.controller.task;

import com.example.pai.controller.task.dto.TaskNoteDto;
import com.example.pai.service.TaskNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/task-notes")
@RequiredArgsConstructor
public class TaskNoteController {

    private final TaskNoteService taskNoteService;

    @PostMapping("/task/{taskId}")
    public ResponseEntity<TaskNoteDto.TaskNoteResponse> createTaskNote(
            @PathVariable UUID taskId,
            @RequestBody TaskNoteDto.TaskNoteRequest request) {
        return new ResponseEntity<>(taskNoteService.createTaskNote(taskId, request), HttpStatus.CREATED);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskNoteDto.TaskNoteResponse>> getTaskNotes(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskNoteService.getTaskNotes(taskId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskNoteDto.TaskNoteResponse> updateTaskNote(
            @PathVariable UUID id,
            @RequestBody TaskNoteDto.TaskNoteUpdateRequest request) {
        return taskNoteService.updateTaskNote(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskNote(@PathVariable UUID id) {
        if (taskNoteService.deleteTaskNote(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/task/{taskId}/count")
    public ResponseEntity<Long> getTaskNoteCount(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskNoteService.getTaskNoteCount(taskId));
    }
}