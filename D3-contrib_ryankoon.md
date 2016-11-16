AutoTest: 100%  
Test Coverage: 96.64% (Statements)

<h2> D3 Contributions - Ryan Koon </h2>

<h3> Code Contributions </h3>

Since features are often heavily broken down into multiple commits, these are links to the pull request of the feature 
branches.
These branches represent key contributions more than a single commit would in our case.  
https://github.com/CS310-2016Fall/cpsc310project_team52/pulls?q=is%3Apr+is%3Aclosed+author%3Aryankoon+milestone%3AD3

To parallelize the tasks, I focused on the (non-parsing) parts and converged with Alek's implementation of the HTML 
parser. Tests are written at the same time as the feature is being developed and is part of each feature branch.  

1. Support new keys and design new building and room interfaces to ensure minimal changes required in queryController to
support the rooms dataset.  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/51

2. Created the GeoService class to connect to API for getting building latlon  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/53

3. Wired up my GeoService to the parser code to generate correct room objects  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/55

4. Updated parser to associate rooms with correct buildings and store them in the same structure as the courses dataset  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/56

5. Handling DNS errors when calling API  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/57

6. Traverse the entire query to get the all dataset ids and reject query with multiple datasets  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/58

7. Bug Fixes  
Fix: Tests and Error message not displaying in UI  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/60  
Undefined value for room column  
https://github.com/CS310-2016Fall/cpsc310project_team52/commit/3ac66bb6d6a33e81cf87e384fc4470a6e572d965  
Fix for D1 support (multiple datasets in query) - WIP  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/61

8. Improve code coverage with test flags in Dataset Controller  
https://github.com/CS310-2016Fall/cpsc310project_team52/pull/62

<h3> Non-Code Contributions </h3>

Documentation
- documented the methods in the parser class to understand the implementation before wiring up my pieces and to help 
debug the code

Managing the board
- Creating tickets to get a clear picture of the tasks ahead
- Updating the status of the tickets
- Documenting approaches and requirements in the tickets

Working with Alek
- Ensure that the parsing will result in the datastructure I am expecting
- Verified my approaches with Alek
- Clarified my implementations and sought for clarifications on Alek's code to ensure a smooth integration of our code
