package com.code.DayTracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DayTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DayTrackerApplication.class, args);
	}

}
