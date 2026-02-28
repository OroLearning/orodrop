/**
 * Data structures for the StoryLaunch AI application.
 * These interfaces define the shape of the data returned by the Gemini API
 * and how it's stored in the application state and history.
 */

export interface StoryDay {
  day: number;                    // The sequence day number (1-14)
  hook: string;                   // The attention-grabbing first line for the story
  value: string;                  // The core educational or emotional content of the story
  cta: string;                    // The "Call to Action" instruction for the viewer
  visualIdea: string;             // A description of what the user should show on screen
  shotList?: string[];            // Technical camera directives (only in Director Mode)
  moveForwardCriteria: string;    // KPIs/Metrics to check before proceeding to the next day
}

export interface LaunchSequence {
  productName: string;            // The name of the product being launched
  audience: string;               // The target audience summary
  sequence: StoryDay[];           // The array of 14-day story objects
}