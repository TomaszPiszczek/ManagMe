package com.example.pai.service;

import com.example.pai.controller.task.dto.TaskNoteDto;
import com.example.pai.dao.model.Task;
import com.example.pai.dao.model.TaskNote;
import com.example.pai.dao.model.UserManagment;
import com.example.pai.dao.repository.TaskNoteRepository;
import com.example.pai.dao.repository.TaskRepository;
import com.example.pai.dao.repository.UserRepository;
import com.example.pai.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskNoteService {

    private final TaskNoteRepository taskNoteRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public TaskNoteDto.TaskNoteResponse createTaskNote(UUID taskId, TaskNoteDto.TaskNoteRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        UserManagment currentUser = authService.getCurrentUser();
        
        TaskNote taskNote = new TaskNote();
        taskNote.setTask(task);
        taskNote.setUser(currentUser);
        taskNote.setNoteText(request.getNoteText());
        taskNote.setIsAdminNote(request.getIsAdminNote() != null ? request.getIsAdminNote() : false);
        
        TaskNote savedNote = taskNoteRepository.save(taskNote);
        
        // Mark task as having unread notes
        task.setHasUnreadNotes(true);
        taskRepository.save(task);
        
        return mapToTaskNoteResponse(savedNote);
    }

    @Transactional(readOnly = true)
    public List<TaskNoteDto.TaskNoteResponse> getTaskNotes(UUID taskId) {
        return taskNoteRepository.findByTaskIdOrderByCreationTimestamp(taskId).stream()
                .map(this::mapToTaskNoteResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<TaskNoteDto.TaskNoteResponse> updateTaskNote(UUID id, TaskNoteDto.TaskNoteUpdateRequest request) {
        return taskNoteRepository.findById(id)
                .map(taskNote -> {
                    taskNote.setNoteText(request.getNoteText());
                    TaskNote updatedNote = taskNoteRepository.save(taskNote);
                    return mapToTaskNoteResponse(updatedNote);
                });
    }

    @Transactional
    public boolean deleteTaskNote(UUID id) {
        return taskNoteRepository.findById(id)
                .map(taskNote -> {
                    taskNoteRepository.delete(taskNote);
                    return true;
                })
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public Long getTaskNoteCount(UUID taskId) {
        return taskNoteRepository.countByTaskId(taskId);
    }

    private TaskNoteDto.TaskNoteResponse mapToTaskNoteResponse(TaskNote taskNote) {
        return TaskNoteDto.TaskNoteResponse.builder()
                .id(taskNote.getId())
                .taskId(taskNote.getTask().getId())
                .userId(taskNote.getUser().getId())
                .userName(taskNote.getUser().getName())
                .noteText(taskNote.getNoteText())
                .isAdminNote(taskNote.getIsAdminNote())
                .creationTimestamp(taskNote.getCreationTimestamp())
                .modificationTimestamp(taskNote.getModificationTimestamp())
                .build();
    }
}