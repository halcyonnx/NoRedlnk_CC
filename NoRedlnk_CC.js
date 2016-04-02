var parse = require('csv-parse');
const fs = require('fs');
const readline = require('readline');

var questionsFile = 'questions.csv';

var strands = {};

var quizNumber = 0;

var parser = parse({delimiter: ','}, function(err, data) {

  // After reading in questions.csv, we want to seperate the questions by strands
  data.slice(1).forEach(function(el, index) {
    if (!strands[el[0]]) {
      strands[el[0]] = [];
    }

    strands[el[0]].push(el);
  });

  // Start the quiz
  quiz();
});

fs.createReadStream(questionsFile).pipe(parser);

var quiz = function() {

  const quizLine = readline.createInterface(process.stdin, process.stdout);

  quizLine.setPrompt('Select # of questions for quiz: ');

  quizLine.prompt();

  quizLine.on('line', function(line) {

    var response = Number(line.trim());

    // Test to see if input is valid
    if (Number.isInteger(response) && response > 0 ) {

      console.log(selectQuestions(response));
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

  var strandKeys = Object.keys(strands);
  var strandPos = Math.floor(Math.random() * strandKeys.length);

  // For each potential questions in the quiz
  for (var i = 0; i < numberOfQuestions; i++) {

    // We pick curr strand and randomly get a question from it
    currStrand = strands[strandKeys[strandPos]];
    currQuestion = currStrand[Math.floor(Math.random() * currStrand.length)];

    selectedQuestions.push(currQuestion);

    // We then continue looping through the potential strands
    if (++strandPos >= strandKeys.length) {
      strandPos = 0;
    }

  }

  return selectedQuestions;
};