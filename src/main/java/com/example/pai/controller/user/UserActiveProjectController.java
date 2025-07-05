package com.example.pai.controller.user;

import com.example.pai.service.UserActiveProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserActiveProjectController {

    private final UserActiveProjectService userActiveProjectService;

    @GetMapping("/{userId}/active-project")
    public ResponseEntity<UUID> getActiveProject(@PathVariable UUID userId) {
        return userActiveProjectService.getActiveProject(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/active-project/{projectId}")
    public ResponseEntity<Void> setActiveProject(@PathVariable UUID userId, @PathVariable UUID projectId) {
        if (userActiveProjectService.setActiveProject(userId, projectId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}