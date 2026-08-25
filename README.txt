Tracking Climate Data — Module 2 playful guided-research rebuild

Design intent
- Playful garden/field-notebook visual language
- Questions come before the Kaltura tutorial
- Corvallis is guided practice, one climate question per page
- Each page gives the exact xmACIS settings needed for that question
- Learners repeat the same research at their own station
- Local responses save to localStorage under:
  fieldNotebook.climateSnapshot

Research questions
1. Long-term average temperature change
2. Long-term total precipitation change
3. Change in timing of last spring freeze (minimum temperature <=32 F)

Journal integration
This package saves the local climate snapshot in browser storage. The separate Field Notebook repository still needs a reader for the same localStorage key before the entry will visibly appear there.

Kaltura tutorial
Uses the previously supplied Kaltura entry 1_ipztpux2.

xmACIS
https://xmacis.rcc-acis.org/

This is a review build. Corvallis spring-freeze answer feedback is intentionally non-prescriptive until the exact station/product output is reviewed in the live tool.

v3 instruction update
- Corvallis station workflow now follows learner sequence:
  Single-Station > Seasonal Time Series > Station Selection SEARCH > 97331 > Go > Corvallis State University.
- Question 2 keeps Corvallis selected and changes only the climate variable.
- Question 3 keeps Corvallis selected and changes to First/Last Dates.
- Own-site investigation explicitly tells learners to SEARCH by their own ZIP code and click Go.

v4 instructional sequence
- The Kaltura video is now explicitly a worked example: Corvallis Seasonal Time Series > Annual Average Temperature.
- Immediately after the video, learners recreate that same graph themselves.
- The temperature setup is presented only as a compact reminder, not a second tutorial.
- Precipitation is framed as the first transfer task: use the same Seasonal Time Series method for a new variable.
- Spring freeze is framed as a new type of climate question requiring a different xmACIS view.
- Temperature feedback explicitly reinforces weather (year-to-year variation) versus climate (long-term pattern).

v6 accessibility pathways
- Main graph-based activity has one small link to a parallel table-based version.
- Table version lives in /table/index.html and follows the same sequence and questions.
- Explanations for interpreting tables are collapsed in optional <details> controls to keep reading load low.
- Seasonal table comparison asks learners to compare spring and summer regression results numerically.

v7 review updates
- New Kaltura video embed (entry_id 1_53ch9qjz), responsive up to 800px wide.
- Annual temperature wording now explicitly refers to average annual temperature.
- Temperature reminder now tells learners: Options Selection > More Options > add Regression Line.
- Regression-line explanation moved to the first annual-temperature example.
- xmACIS precipitation dropdown wording corrected to "Precipitation."
- Corvallis order changed to:
  1. Annual average temperature
  2. Spring vs summer average temperature
  3. Annual precipitation
- Graph and table pathways kept in the same order.
