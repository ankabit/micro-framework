import { EVENTS } from './constants.js';

/**
 * Event Manager - Handles centralized event emission with debugging
 */
export class EventManager {
    constructor(framework, options = {}) {
        this.framework = framework;
        this.config = {
            enableLogging: options.enableLogging || false,
            logPrefix: options.logPrefix || '[Event]',
            ...options
        };
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Emit an event (fire and forget - no response handling)
     * @param {string} eventName - The event name
     * @param {*} data - The event data
     * @param {string} source - The source of the event
     */
    emit(eventName, data = null, source = 'framework') {
        // Validate event name
        if (!this.isValidEvent(eventName)) {
            console.warn(`Unknown event emitted: ${eventName}`);
        }

        // Log event if enabled
        if (this.config.enableLogging) {
            console.log(`${this.config.logPrefix} EMIT ${eventName}`, data);
        }

        // Track in history
        this.addToHistory(eventName, data, source);

        // Fire and forget - no response handling
        this.framework.emitRaw(eventName, data);
    }

    /**
     * Emit an event and process data through listeners as a filter chain
     * @param {string} eventName - The event name
     * @param {*} data - The event data
     * @param {string} source - The source of the event
     * @returns {Promise<*>} - Final filtered/transformed data
     */
    async filter(eventName, data = null, source = 'framework') {
        // Validate event name
        if (!this.isValidEvent(eventName)) {
            console.warn(`Unknown event emitted: ${eventName}`);
        }

        // Log event if enabled
        if (this.config.enableLogging) {
            console.log(`${this.config.logPrefix} FILTER ${eventName}`, data);
        }

        // Track in history
        this.addToHistory(`${eventName}:filter`, data, source);

        // Process data through filter chain
        const finalData = await this.framework.filterRaw(eventName, data);

        // Log final data if enabled
        if (this.config.enableLogging) {
            console.log(`${this.config.logPrefix} FILTER RESULT ${eventName}`, finalData);
        }

        // Track final data in history
        this.addToHistory(`${eventName}:filter-result`, finalData, source);

        return finalData;
    }

    /**
     * Check if event name is registered
     */
    isValidEvent(eventName) {
        return Object.values(EVENTS).includes(eventName);
    }

    /**
     * Add event to history for debugging
     */
    addToHistory(eventName, data, source) {
        const event = {
            name: eventName,
            data,
            source,
            timestamp: Date.now(),
            time: new Date().toISOString()
        };

        this.eventHistory.push(event);
        
        // Keep history size manageable
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Get event history for debugging
     */
    getHistory() {
        return [...this.eventHistory];
    }

    /**
     * Get all registered event names
     */
    getEventNames() {
        return Object.values(EVENTS);
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }
}