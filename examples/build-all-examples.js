/*
To execute this script, run the following commands in the terminal:

cd examples
node build-all-examples.js > build-results.txt
*/
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const main = async () => {
  /* 1) Get a list of all the example directory names */
  
  let exampleDirectoryNames
  
  const { stdout } = await exec('ls -p')
  exampleDirectoryNames = stdout.split('\n')
    .filter(s => s.slice(-1) === '/')
  
  /*
  2) For each example directory:
    - cd into the directory
    - run npm install (check for errors)
    - run npm build (check for errors)
  */
  const results = exampleDirectoryNames.map(async (exampleDirectoryName, index) => {
    if (index > 3) return
    
    let err, stdout, stderr
    let result

    console.log("👀 CHECKING:", exampleDirectoryName)
    
    // try npm install
    try {
      console.log(`Installing ${exampleDirectoryName}...`)
      result = await exec(`cd ${exampleDirectoryName} && npm i`)
      
      // err = result.error
      // stdout = result.stdout
      // stderr = result.stderr
      
      // if (err) {
      //   console.log(`ERROR installing ${exampleDirectoryName}`)
      //   return
      // }
      console.log('Successfully installed:', exampleDirectoryName)
    } catch(e) {
      console.log(`🚨 ERROR installing ${exampleDirectoryName}`)
    }
    
    // try gatsby build
    try {
      console.log(`Building ${exampleDirectoryName}...`)
      await exec(`pwd`)
      result = await exec(`cd ${exampleDirectoryName} && gatsby build`)
      
      // err = result.error
      // stdout = result.stdout
      // stderr = result.stderr
      
      // if (err) {
      //   console.log(`ERROR building ${exampleDirectoryName}`)
      //   return
      // }
      console.log('✅ SUCCESS building:', exampleDirectoryName)
    }
    catch (e) {
      console.log(`🚨 ERROR building ${exampleDirectoryName}`)
    }
  })

  await Promise.all(results)
}

main()
