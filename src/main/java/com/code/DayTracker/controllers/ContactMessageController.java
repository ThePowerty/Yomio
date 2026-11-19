package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.ContactMessageRequest;
import com.code.DayTracker.dto.ContactMessageResponse;
import com.code.DayTracker.services.ContactMessageService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact-messages")
public class ContactMessageController {
    private final ContactMessageService service;
    public ContactMessageController(ContactMessageService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse create(@Valid @RequestBody ContactMessageRequest request, Principal principal) { return service.create(principal.getName(), request); }
    @GetMapping public List<ContactMessageResponse> list() { return service.list(); }
    @PatchMapping("/{id}/resolve") public ContactMessageResponse resolve(@PathVariable Long id) { return service.resolve(id); }
}
