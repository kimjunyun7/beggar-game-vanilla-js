# Beggar Game

## Overview

A simple incremental clicker game built with pure vanilla JavaScript. Players take on the role of a beggar who earns money through clicking and purchasing upgrades that provide passive income and click bonuses. The game features a visual character representation, various upgrades (appearance, location, dog companion, sign, cup), and persistent save/load functionality using localStorage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure Vanilla JavaScript**: No frameworks or libraries used, keeping the codebase lightweight and dependency-free
- **Class-based Game Engine**: Single `BeggarGame` class manages all game state and logic
- **DOM Manipulation**: Direct DOM element caching and manipulation for performance optimization
- **CSS3 Animations**: Visual feedback and character animations handled entirely through CSS

### Game State Management
- **Local State Storage**: All game data stored in class properties (money, upgrades, level progression)
- **Persistent Storage**: localStorage implementation for save/load functionality with automatic saving
- **Game Loop**: setInterval-based game loop for passive income generation and real-time updates

### UI/UX Design
- **Responsive Layout**: Flexbox-based layout system with mobile-first design approach
- **Visual Character System**: CSS-based beggar character with upgrade-dependent visual changes
- **Interactive Elements**: Click-based interaction system with visual feedback
- **Upgrade System**: Tiered upgrade structure affecting both passive income and click bonuses

### Performance Optimizations
- **Element Caching**: DOM elements cached on initialization to avoid repeated queries
- **Efficient Updates**: Targeted DOM updates only when values change
- **Automatic Save System**: Periodic save intervals to prevent data loss without impacting performance

## External Dependencies

### Browser APIs
- **localStorage**: For persistent game state storage across browser sessions
- **DOM API**: For element manipulation and event handling
- **Timer APIs**: setInterval for game loop and automatic saving functionality

### No External Libraries
- No third-party JavaScript libraries or frameworks
- No external CSS frameworks
- No server-side dependencies or API integrations
- Completely self-contained client-side application