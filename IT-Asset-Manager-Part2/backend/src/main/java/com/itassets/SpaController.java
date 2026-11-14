package com.itassets;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** The packaged JAR serves the React build and supports direct browser navigation. */
@Controller
public class SpaController {
    // Exclude dots so /assets/index-<hash>.js reaches Spring's static resource handler.
    @GetMapping({"/", "/assets", "/assets/{id:[^.]+}", "/assets/{id:[^.]+}/edit", "/about"})
    public String index() { return "forward:/index.html"; }
}
