const catName = require('cat-names').random()
const dogName = require('dog-names').allRandom()
const pokemon = require('pokemon').random()
const superhero = require('superheroes').random()
const supervillain = require('supervillains').random()
const animals = require('../../constants/animals')
const randAnimal = animals[Math.floor(Math.random() * animals.length)]
const superbName = require('superb').random()
const adjectives = require('../../constants/adjectives')
const qualifiers = Object.assign(adjectives, superbName)
const qualifier = qualifiers[Math.floor(Math.random() * qualifiers.length)]
const words = [randAnimal, catName, dogName, pokemon, superhero, supervillain]

const names = () => {
  return qualifier + ' ' + words[Math.floor(Math.random() * words.length)].toLowerCase()
}

module.exports = names
