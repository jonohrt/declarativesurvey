var _ = require('ramda');
var Either = require('ramda-fantasy').Either
var inquirer = require('inquirer');
var Task = require('data.task');

var answerKey = [
  {answer: 'Yes', response: 'Man, I knew it!'},
  {answer: 'No', response: 'You should check again.'},
  {answer: 'Screw off', response: "That's not very nice! :("}
]
var contains  = _.flip(_.contains)
var acceptedAnwers = _.map(_.prop('answer'))
var isValidAnswer = contains(acceptedAnwers(answerKey))

var promptQuestion = function(questions) {
  return new Task(function(reject, result) {
    inquirer.prompt(questions).then(function(answers) {
      return result(answers)
    }, (err) =>  reject("Oh noes!"))
  })
}

var log = function(x) {
  return new Task(function(reject, result) {
    console.log(x);
    result(x)
  })
}

var append = _.flip(_.concat)

var transformAnswer = function(answer) {
 return `
    You: ${_.prop('answer', answer)}
    Me: ${_.prop('response', answer)}
  `
}

var validateAnswer = function(answer) {
  return isValidAnswer(answer) ?
    Either.Right(answer) :
    Either.Left("Not a valid answer")
}

var findAnswer = _.flip(_.find)(answerKey);

var buildResponse = _.pipe(
  _.propEq('answer'),
  findAnswer,
  transformAnswer
)

var createMessage = _.pipe(
  promptQuestion,
  _.map(
    _.pipe(
      _.prop("userResponse"),
      validateAnswer,
      Either.either(_.identity, buildResponse)
    )
  ),
  _.chain(log)
)

createMessage([{name: "userResponse", message: "Are you stupid?"}]).fork((err) => {console.log("err: ", err)},
  () => {}
)
