package com.code.DayTracker.services;

import com.code.DayTracker.dto.ContactMessageRequest;
import com.code.DayTracker.dto.ContactMessageResponse;
import com.code.DayTracker.models.ContactMessage;
import com.code.DayTracker.repositories.ContactMessageRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactMessageService {
    private final ContactMessageRepository messages;
    private final UserRepository users;
    public ContactMessageService(ContactMessageRepository messages, UserRepository users) { this.messages = messages; this.users = users; }

    @Transactional
    public ContactMessageResponse create(String username, ContactMessageRequest request) {
        var user = users.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ContactMessageResponse.from(messages.save(new ContactMessage(user, request.category(), request.subject().trim(), request.message().trim())));
    }
    @Transactional(readOnly = true)
    public List<ContactMessageResponse> list() { return messages.findAllForAdmin(PageRequest.of(0, 100)).stream().map(ContactMessageResponse::from).toList(); }
    @Transactional
    public ContactMessageResponse resolve(Long id) {
        var message = messages.findById(id).orElseThrow(() -> new IllegalArgumentException("Contact message not found"));
        message.resolve();
        return ContactMessageResponse.from(message);
    }
}
