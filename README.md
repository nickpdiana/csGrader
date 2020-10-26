# 101 Grader

## Usage

Run `node app.js` to start server. Then navigate to `127.0.0.1:3000`

Once, the webpage opens, update the path in the **HW Directory** field to be the path to the directory containing a directory called `output` which contains directories for each student. For example:

```
|-- /Users/ndiana/Documents/Classes/Fall2020/COSC101/grading/hw04
|   |-- output/
|       |-- smithjo/
|       |-- jonesja/
|       |-- millerwi/
...
```

**Note:** This directory can either be the resulting directory created by running Joel's reformatting/testing script OR simply the unzipped submissions file from Moodle. However, in the latter case, you should also tick the **Names Need Reformatting** box, because the program uses directory names as the source for student names. In either case, the program looks for the specific name `output`.

## Shortcuts

### Navigating Students
&downarrow; (Down Arrow) = Next Student  
&uparrow; (Up Arrow) = Previous Student  

### Navigating Files
&leftarrow; (Left Arrow) = Previous File  
&rightarrow; (Right Arrow) = Next File  

### Grading
*Note: While Grade Input and Comment Input are selected, other navigation key shortcuts are disabled*  
Tab = Jump to **Grade Input**/Switch between **Grade Input** and **Comment Input**  
Escape = Exit **Grade Input** or **Comment Input** (re-enable other shortcuts)  