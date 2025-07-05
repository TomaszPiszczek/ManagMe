package com.example.pai.service;

import com.example.pai.controller.task.dto.TaskDto;
import com.example.pai.dao.model.Task;
import com.example.pai.dao.model.UserManagment;
import com.example.pai.dao.repository.ProjectRepository;
import com.example.pai.dao.repository.TaskRepository;
import com.example.pai.dao.repository.TaskNoteRepository;
import com.example.pai.dao.repository.UserManagmentRepository;
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
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserManagmentRepository userManagmentRepository;
    private final ProjectRepository projectRepository;
    private final TaskNoteRepository taskNoteRepository;

    @Transactional(readOnly = true)
    public List<TaskDto.TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto.TaskResponse> getTasksByProjectId(UUID projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto.TaskResponse> getTasksByAssignedUser(UUID assignedUserId) {
        return taskRepository.findByAssignedUserId(assignedUserId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<TaskDto.TaskResponse> getTaskById(UUID id) {
        return taskRepository.findById(id)
                .map(this::mapToTaskResponse);
    }

    @Transactional
    public TaskDto.TaskResponse createTask(TaskDto.TaskRequest taskRequest) {
        Task task = new Task();
        task.setName(taskRequest.getName());
        task.setDescription(taskRequest.getDescription());
        task.setPriority(taskRequest.getPriority());
        task.setEstimatedTime(taskRequest.getEstimatedTime());
        task.setState(Task.TaskState.NOT_STARTED);

        if (taskRequest.getProjectId() != null) {
            projectRepository.findById(taskRequest.getProjectId())
                    .ifPresent(task::setProject);
        }

        if (taskRequest.getAssignedUserId() != null) {
            userManagmentRepository.findById(taskRequest.getAssignedUserId())
                    .ifPresent(user -> {
                        if ("DEVELOPER".equals(user.getRole().getName()) ||
                                "DEVOPS".equals(user.getRole().getName())) {
                            task.setAssignedUser(user);
                            // Set assignment timestamp from request or current time
                            if (taskRequest.getAssignmentTimestamp() != null) {
                                task.setAssignmentTimestamp(taskRequest.getAssignmentTimestamp());
                            } else {
                                task.setAssignmentTimestamp(LocalDateTime.now());
                            }
                        }
                    });
        }

        Task savedTask = taskRepository.save(task);
        return mapToTaskResponse(savedTask);
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> updateTask(UUID id, TaskDto.TaskUpdateRequest updateRequest) {
        return taskRepository.findById(id)
                .map(task -> {


                    if (updateRequest.getName() != null) {
                        task.setName(updateRequest.getName());
                    }

                    if (updateRequest.getDescription() != null) {
                        task.setDescription(updateRequest.getDescription());
                    }

                    if (updateRequest.getPriority() != null) {
                        task.setPriority(updateRequest.getPriority());
                    }

                    if (updateRequest.getEstimatedTime() != null) {
                        task.setEstimatedTime(updateRequest.getEstimatedTime());
                    }

                    if (updateRequest.getState() != null) {
                        task.setState(updateRequest.getState());
                    }

                    if (updateRequest.getAssignedUserId() != null) {
                        userManagmentRepository.findById(updateRequest.getAssignedUserId())
                                .ifPresent(user -> {
                                    if ("DEVELOPER".equals(user.getRole().getName()) ||
                                            "DEVOPS".equals(user.getRole().getName())) {
                                        task.setAssignedUser(user);
                                    }
                                });
                    }


                    Task updatedTask = taskRepository.save(task);
                    return mapToTaskResponse(updatedTask);
                });
    }

    @Transactional
    public boolean deleteTask(UUID id) {
        return taskRepository.findById(id)
                .map(task -> {
                    taskRepository.delete(task);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> assignTask(UUID taskId, UUID userId) {
        return taskRepository.findById(taskId)
                .flatMap(task -> userManagmentRepository.findById(userId)
                        .filter(user -> "DEVELOPER".equals(user.getRole().getName()) ||
                                       "DEVOPS".equals(user.getRole().getName()))
                        .map(user -> {
                            task.setAssignedUser(user);
                            task.setAssignmentTimestamp(LocalDateTime.now());
                            if (task.getState() == Task.TaskState.NOT_STARTED) {
                                task.setState(Task.TaskState.IN_PROGRESS);
                            }
                            Task savedTask = taskRepository.save(task);
                            return mapToTaskResponse(savedTask);
                        }));
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> changeTaskStatus(UUID taskId, String status) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    Task.TaskState newState = Task.TaskState.valueOf(status.toUpperCase());
                    
                    if (newState == Task.TaskState.IN_PROGRESS && task.getAssignedUser() == null) {
                        return null;
                    }
                    
                    if (newState == Task.TaskState.FINISHED && task.getAssignedUser() == null) {
                        return null;
                    }
                    
                    task.setState(newState);
                    Task savedTask = taskRepository.save(task);
                    return mapToTaskResponse(savedTask);
                });
    }


    @Transactional
    public Optional<TaskDto.TaskResponse> startTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    if (task.getAssignedUser() == null) {
                        throw new RuntimeException("Task must be assigned to a user before starting");
                    }
                    task.setState(Task.TaskState.IN_PROGRESS);
                    task.setStartTimestamp(LocalDateTime.now());
                    Task savedTask = taskRepository.save(task);
                    return mapToTaskResponse(savedTask);
                });
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> finishTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    if (task.getAssignedUser() == null) {
                        throw new RuntimeException("Task must be assigned to a user before finishing");
                    }
                    task.setState(Task.TaskState.WAITING_FOR_APPROVAL);
                    Task savedTask = taskRepository.save(task);
                    return mapToTaskResponse(savedTask);
                });
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> approveTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    if (task.getState() != Task.TaskState.WAITING_FOR_APPROVAL) {
                        throw new RuntimeException("Task must be waiting for approval to be approved");
                    }
                    task.setState(Task.TaskState.APPROVED);
                    task.setCompletionTimestamp(LocalDateTime.now());
                    Task savedTask = taskRepository.save(task);
                    return mapToTaskResponse(savedTask);
                });
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> rejectTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    if (task.getState() != Task.TaskState.WAITING_FOR_APPROVAL) {
                        throw new RuntimeException("Task must be waiting for approval to be rejected");
                    }
                    task.setState(Task.TaskState.REJECTED);
                    Task savedTask = taskRepository.save(task);
                    return mapToTaskResponse(savedTask);
                });
    }

    @Transactional
    public Optional<TaskDto.TaskResponse> markNotesAsRead(UUID taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    task.setHasUnreadNotes(false);
                    Task savedTask = taskRepository.save(task);
                    return mapToTaskResponse(savedTask);
                });
    }

    @Transactional
    public void deleteTasksByProjectId(UUID projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        if (!tasks.isEmpty()) {
            taskRepository.deleteAll(tasks);
        }
    }

    private TaskDto.TaskResponse mapToTaskResponse(Task task) {
        TaskDto.TaskResponse response = new TaskDto.TaskResponse();
        response.setId(task.getId());
        response.setName(task.getName());
        response.setDescription(task.getDescription());
        response.setPriority(task.getPriority());
        response.setState(task.getState());
        response.setEstimatedTime(task.getEstimatedTime());
        response.setCreationTimestamp(task.getCreationTimestamp());
        response.setStartTimestamp(task.getStartTimestamp());
        response.setCompletionTimestamp(task.getCompletionTimestamp());
        response.setAssignmentTimestamp(task.getAssignmentTimestamp());
        response.setHasUnreadNotes(task.getHasUnreadNotes());
        response.setNoteCount(taskNoteRepository.countByTaskId(task.getId()));

        if (task.getProject() != null) {
            response.setProjectId(task.getProject().getId());
            response.setProjectName(task.getProject().getName());
        }

        if (task.getAssignedUser() != null) {
            response.setAssignedUserId(task.getAssignedUser().getId());
            response.setAssignedUserName(task.getAssignedUser().getName());
            response.setAssignedUser(TaskDto.AssignedUser.builder()
                    .id(task.getAssignedUser().getId())
                    .name(task.getAssignedUser().getName())
                    .email(task.getAssignedUser().getEmail())
                    .build());
        }

        return response;
    }
}