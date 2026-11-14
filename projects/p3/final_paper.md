---
layout: default
title: Project 3 Final Paper
---

# Project 3 Final Paper

---


**Forecast Meal — Proposed Three-Week Plan:**


### Week 1:

- Adapt the weather request flow to retrieve today's National Weather Service forecast for the six selected cities. Add the user-triggered location option with city fallback, and show the chosen city and forecast.


### Week 2:

- Replace open-ended meal requests with the confirmed dietary, ingredient-exclusion, and serving controls. Generate and validate one recipe, then add one-at-a-time substitutions that update quantities and affected steps.


### Week 3:

- Display the AI-estimated per-serving nutrition table with p5.js category icons; complete the Turnstile verified state, location notice, error handling, review, and class demonstration.

The existing Basket Buddy backend has not yet been adapted to this proposal. Forecast Meal development and cleanup of the earlier price-search code await approval of the plan.


## Success Criteria

- The user can choose one of the six cities or explicitly enable device location, and the app identifies the location and today's forecast.
- The meal flow has no open-ended text box; it accepts only its supported meal controls and rejects unsupported request fields.
- With no preference selections, the app suggests one balanced meal with vegetables, a protein, and a grain or starch.
- The selected dietary pattern and ingredient exclusions are reflected in the recipe; choosing one to four servings updates the quantities.
- A user can request and apply one ingredient substitution at a time. The result respects the chosen preferences and updates the relevant quantities, instructions, and nutrition estimates.
- The nutrition table shows calories, protein, carbohydrates, total fat, fiber, and sodium per serving, with an icon for each category and the accuracy disclaimer.
- The server validates the structured response and rejects malformed or unsupported model output.
- Turnstile's challenge remains visible when required, disappears after successful verification, and leaves a visible “Verified” status. The challenge reappears if verification expires or fails.
- p5.js displays a distinct, reusable icon for each nutrient category alongside the nutrition table.
- The app is free for its intended class users, and the deployment avoids paid services and stops gracefully at verified free-tier limits.
- The location notice accurately states how the location and forecast information are sent and used.

---


## Developer Note

- This project concept is original and owned by Ken Pao. AI assisted with research and drafting the proposal.
- As an experiment, even for a simple task, I found many limitations and learned that pricing data generally available to users is not available for developers to use.
- Using AI to develop an AI-powered app with p5.js is both a fun and frustrating experience. The fun part is the speed and ability to build more complex features with fewer headaches. The frustrating part is spending extra time and effort debugging AI-generated bugs, only to discover that the code is unnecessary and end up deleting it.
- Based on initial user feedback and Instructor Tyler's feedback, I might have to pivot a bit, using AI to do more of the heavy lifting and reducing the emphasis on pricing or using it only as a reference point.
- I tested Basket Buddy's Open Prices approach and built a 50-mile product catalog. The snapshot had 42,342 observations, but only 3,904 were from the previous 30 days; a sample returned prices 100, 271, and 289 days old. Expanding to 300 miles added only three recent observations. I also found uneven ingredient/package matching. For example, a full bottle of soy sauce for one meal is not a practical shopping suggestion. These results made a larger search radius an ineffective fix. ([50-mile snapshot analysis](open-prices-hayward-50mi-analysis.md); [radius comparison](open-prices-radius-expansion-analysis-2026-11-10.md))
- Instructor Tyler and Associate Professor Ian also asked why the project searched a 50-mile area, why a user could not substitute an ingredient, why the list could require shopping at multiple places instead of one convenient shop, and why there were no cuisine or dietary choices. I took that feedback as evidence that the original project focused on product-price matching before it had a practical cooking interaction.
- I looked at two existing products before changing direction. Eat AI already advertises meals adapted to local weather; Mealime offers established meal planning, personalization, recipes, servings, grocery lists, and guided cooking. Forecast Meal is not a new commercial idea and does not try to compete feature-for-feature. I am keeping it as a small, no-charge class experiment that combines Project 2's local forecast data with one meal, preference and substitution controls, and a p5.js nutrition table with category icons. ([Eat AI](https://apps.apple.com/us/app/eat-ai-weather-meal-planner/id6767874649); [Mealime](https://www.mealime.com/))
- I changed the planned result visual from a p5.js meal illustration to a per-serving nutrition table with category icons. The AI will estimate common nutrient values informed by USDA FoodData Central references, with a one-line disclaimer that the values may be inaccurate and are for reference only.