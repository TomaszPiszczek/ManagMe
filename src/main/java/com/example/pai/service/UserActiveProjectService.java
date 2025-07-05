package com.example.pai.service;

import com.example.pai.dao.model.UserActiveProject;
import com.example.pai.dao.repository.ProjectRepository;
import com.example.pai.dao.repository.UserActiveProjectRepository;
import com.example.pai.dao.repository.UserManagmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserActiveProjectService {

    private final UserActiveProjectRepository userActiveProjectRepository;
    private final UserManagmentRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public Optional<UUID> getActiveProject(UUID userId) {
        return userActiveProjectRepository.findByUserId(userId)
                .map(userActiveProject -> userActiveProject.getProject().getId());
    }

    @Transactional
    public boolean setActiveProject(UUID userId, UUID projectId) {
        return userRepository.findById(userId)
                .flatMap(user -> projectRepository.findById(projectId)
                        .map(project -> {
                            UserActiveProject activeProject = userActiveProjectRepository
                                    .findByUserId(userId)
                                    .orElse(new UserActiveProject());
                            
                            activeProject.setUser(user);
                            activeProject.setProject(project);
                            userActiveProjectRepository.save(activeProject);
                            return true;
                        }))
                .orElse(false);
    }
}