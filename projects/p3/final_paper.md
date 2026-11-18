---
layout: default
title: Project 3 Final Paper
---

# Project 3 Final Paper

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
- Started building prototype, fun but frustrated. Made some progress, but after replacing Cloudflare worker, found a hidden bug from Cloudflare Turnstile. That drove me back to square one. Removed turnstile completely for now since it is just a nice-to-have feature and will revisit once have more time, but at least that clear the error and prototype stage 1 is working.
- Finished building a working prototype and passed tests successfully. 
- Revisit turnstile one more time, experience a worsen behavior with error code 600010. AI is not able to help debug. 3-4 hours wasted. Enforeced a rule to not using turnstile anymore.
- Removed turnstile 2nd time fix everything. Prototype is live on github page and working. 
- Identified a recipe 502 blocking bug for validation to selected dietry preference, and if any AI-generated ingredient didn't pass that validation, Cloudflare worker will issue a 502 to not return the recipe to github pages and github page just display a red-highlight error message.
- Redesign the recipe error handling and decided to allow any AI-generated recipe, with confirmed prompt to include user selected preferences so AI will generate a more appropriate and matching with best effort with a light-orange color highlight on ingredients that didn't satisfy any user selected preference. It also display a warning message so user clearly understand what that light-orange highlighted ingredient mean.
- Tested live prototype and working.
- I also added a final paper preference and a landing page, so it has a project frontend with Project title, name, date, instructions, description, and a separate about page to talk about design principle to match what applied based on Norman's DOET book and my journal entries.
- Updated table format and status on this page for tracking purpose.