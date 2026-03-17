const vm = require('vm');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Execute code against test cases
 * @param {string} code - The code to execute
 * @param {string} language - 'javascript' or 'python'
 * @param {Array} testCases - Array of test case objects
 */
const executeCode = async (code, language, testCases) => {
  // Blacklist check first
  const banned = ["require", "process", "fs", "child_process", "eval", "fetch", "XMLHttpRequest", "import"];
  for (const term of banned) {
    if (code.includes(term)) {
      return { error: true, message: "Restricted operation: " + term };
    }
  }

  const results = [];
  let hasErrors = false;

  for (const tc of testCases) {
    try {
      if (language === "javascript") {
        let output = null;
        const sandbox = {
          console: {
            log: (v) => { 
                if (typeof v === 'object') {
                    output = JSON.stringify(v);
                } else {
                    output = String(v);
                }
            }
          }
        };
        
        // Wrap user code and call the solution function with tc.input
        // input might be an array or string, so we need to be careful how we pass it
        // If tc.input is "[1, 2]", we can just inject it.
        const wrapped = `${code}\nconst __r = solution(${tc.input});\nif (__r !== undefined) console.log(__r);`;
        
        try {
            vm.runInNewContext(wrapped, sandbox, { timeout: 3000 });
            
            const passed = output?.trim() === tc.expectedOutput?.trim();
            results.push({
              testCaseId: tc._id,
              passed: passed,
              actualOutput: output,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden
            });
        } catch (execErr) {
            hasErrors = true;
            results.push({
                testCaseId: tc._id,
                passed: false,
                actualOutput: "Runtime Error: " + execErr.message,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden,
                error: true
            });
        }
      } else if (language === "python") {
        const tmpFile = path.join(os.tmpdir(), `sipp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`);
        const pyCode = `${code}\nprint(solution(${tc.input}))`;
        
        try {
            fs.writeFileSync(tmpFile, pyCode);
            // Using python3 as requested
            const result = execFileSync("python3", [tmpFile], { 
                timeout: 5000,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            const actual = result.toString().trim();
            
            results.push({
              testCaseId: tc._id,
              passed: actual === tc.expectedOutput?.trim(),
              actualOutput: actual,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden
            });
        } catch (execErr) {
            hasErrors = true;
            results.push({
                testCaseId: tc._id,
                passed: false,
                actualOutput: "Runtime Error: " + (execErr.stderr?.toString() || execErr.message),
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden,
                error: true
            });
        } finally {
            if (fs.existsSync(tmpFile)) {
                fs.unlinkSync(tmpFile);
            }
        }
      }
    } catch (err) {
      hasErrors = true;
      results.push({
        testCaseId: tc._id,
        passed: false,
        actualOutput: "System Error: " + err.message,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
        error: true
      });
    }
  }
  
  return { results, hasErrors };
};

module.exports = { executeCode };
