package com.code.DayTracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class MailExecutorConfig {

    @Bean(defaultCandidate = false)
    ThreadPoolTaskExecutor transactionalMailExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix("transactional-mail-");
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(32);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        return executor;
    }
}
