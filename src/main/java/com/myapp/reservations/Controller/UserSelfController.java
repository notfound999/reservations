package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/me")
public class UserSelfController {

    private UserService userService;
    private UUID userId = userService.getCurrentUserId();


    @Autowired
    public UserSelfController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public UserResponse findById(){
        return userService.findById(userId);
    }

    @PutMapping()

}
