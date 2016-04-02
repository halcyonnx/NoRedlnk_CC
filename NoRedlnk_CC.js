const parse = require('csv-parse');
const fs = require('fs');
const readline = require('readline');

var questionsFile = 'questions.csv';
var usageFile = 'usage.csv';

var strands = {};
var students = [];

var quizNumber = 0;

var bias = 70;

var parser = parse({delimiter: ','}, function(err, data) {

  // After reading in questions.csv, we want to seperate the questions by strands
  data.slice(1).forEach(function(el, index) {
    if (!strands[el[0]]) {
      strands[el[0]] = [];
    }

    strands[el[0]].push(el);
  });

  // Read in the usage file and seperate by student
  fs.createReadStream(usageFile).pipe(parse({delimiter: ','}, function(err, data) {
    // data.slice(1).forEach(function(el, index) {
    //   if (!students[el[0]]) {
    //     students[el[0]] = [];
    //   }

    //   students[el[0]].push(el);
    // });
    students = data.slice(1);

    // Start the quiz
    quiz();

  }));

});

// Start reading in data files
fs.createReadStream(questionsFile).pipe(parser);

var quiz = function() {
  // console.log(students);

  const quizLine = readline.createInterface(process.stdin, process.stdout);

  quizLine.setPrompt('Select # of questions for quiz: ');

  quizLine.prompt();

  quizLine.on('line', function(line) {

    var response = Number(line.trim());

    // Test to see if input is valid
    if (Number.isInteger(response) && response > 0 ) {

      // Only need to give the question IDs
      selectQuestions(response).forEach(function(el) {
        console.log(el[4]);
      });
      quizLine.close();
    }
    else {
      // If not valid
      console.log('Please input integer number larger than 0');
      quizLine.prompt();
    }

  });

};

var selectQuestions = function(numberOfQuestions) {

  var selectedQuestions = [];

  var currStrand;
  var currQuestion;

  // rolling the dice
  var roll;

  var strandKeys = Object.keys(strands);
  var strandPos = Math.floor(Math.random() * strandKeys.length);

  // For each potential questions in the quiz
  for (var i = 0; i < numberOfQuestions; i++) {

    // We pick curr strand and randomly get a question from it
    currStrand = strands[strandKeys[strandPos]];
    currQuestion = currStrand[Math.floor(Math.random() * currStrand.length)];

    // We want to prefer to use questions that either have been assigned and not answered
    // or haven't been assigned at all
    if ( (isAssigned(currQuestion[4]) && !isAnswered(currQuestion[4])) || !isAssigned(currQuestion[4]) ) {

      // We then continue looping through the potential strands
      selectedQuestions.push(currQuestion);
      if (++strandPos >= strandKeys.length) {
        strandPos = 0;
      }
    } 
    else {
      // Otherwise we can just roll to see if we still want to include the question
      roll = Math.random() * 100;

      if (roll >= bias) {
        selectedQuestions.push(currQuestion);
        if (++strandPos >= strandKeys.length) {
          strandPos = 0;
        }
      }
      else {
        // We try for another question if we don't
        i--;
      }
    }

  }

  // Simple sorting in ascending difficulty
  selectedQuestions.sort(function(a, b) {
    return a[5] - b[5];
  })

  return selectedQuestions;
};

// Checking to see if given question has been assigend to any student
var isAssigned = function(questionID) {
  for (var i = 0; i < students.length; i++) {
    if (questionID === students[i][1]) {
      return true;
    }
  }
  return false;

};

// Checking to see if at least one student has answered the given question
var isAnswered = function(questionID) {
  for (var i = 0; i < students.length; i++) {
    if (questionID === students[i][1] && students[i][3]) {
      return true;
    }
  }
  return false;
}
