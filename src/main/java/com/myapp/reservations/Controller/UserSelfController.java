package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.UserRequest;
import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasAnyRole('USER','BUSINESS_OWNER','BUSINESS_ADMIN','ADMIN')")
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
    public void update(@PathVariable (value = "id") UUID userId,@Valid @RequestBody UserRequest userRequest){
        if(userRequest == null || userId == null) return ;
        userService.updateUser(userId, userRequest);
    }

    @DeleteMapping()
    public void delete(@PathVariable (value = "id") UUID userId){

        userService.deleteUserById(userId);

    }
}
