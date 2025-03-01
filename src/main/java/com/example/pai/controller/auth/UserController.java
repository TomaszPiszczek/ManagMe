package com.example.pai.controller.auth;



import com.example.pai.dao.model.UserManagment;
import com.example.pai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserManagment>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserManagment> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserManagment> createUser(@RequestBody UserManagment userManagment) {
        return ResponseEntity.ok(userService.createUser(userManagment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserManagment> updateUser(@PathVariable UUID id, @RequestBody UserManagment userManagmentDetails) {
        return userService.updateUser(id, userManagmentDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        if (userService.deleteUser(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

//    @PatchMapping("/{id}/deactivate")
//    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
//        return userService.getUserById(id)
//                .map(user -> {
//                    user.setActivated(false);
//                    userService.updateUser(id, user);
//                    return ResponseEntity.<Void>noContent().build();
//                })
//                .orElse(ResponseEntity.notFound().build());
//    }

    @PatchMapping("/{id}/soft-delete")
    public ResponseEntity<Void> softDeleteUser(@PathVariable UUID id) {
        if (userService.softDeleteUser(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}