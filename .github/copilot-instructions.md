When creating a pull request:
- Provide a clear and concise title that summarizes the changes made.
- Include a detailed description of the changes, including the purpose and any relevant context.
- Reference any related issues or tickets by including their numbers.
- Ensure that your code follows the project's coding standards and guidelines.
- Add appropriate labels to categorize the pull request (e.g., bug fix, feature, documentation).
- Ensure that all tests pass and include new tests if applicable.

When creating a new function or method:
- Write a clear and descriptive docstring that explains the purpose, parameters, return values, and any exceptions raised.
- Include input validation
- Use early returns for error conditions to reduce nesting where appropriate.
- Follow the project's naming conventions and coding style.
- Include type hints for all parameters and return values.
- Write unit tests to cover the new function or method, ensuring it behaves as expected.
- Avoid using overly complex logic; strive for simplicity and readability.
- Document any dependencies or external libraries used within the function or method.


When reviewing code, focus on:
## Security Critical Issues
- Check for hardcoded secrets, API keys, or credentials
- Look for SQL injection and XSS vulnerabilities
- Verify proper input validation and sanitization
- Review authentication and authorization logic

When tasked with creating a new API, focus on:
- Create a new nx project for that api 
- Write unit tests for that api
- Use sqlite for db purposes
- Use nestjs for the API
- Make sure you use authentication
- Use bcrypt or any better security standards for authentication authorization purposes
- Use JWTs
- For ids use UUID-v4 version
  
