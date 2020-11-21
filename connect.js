const nn = require('nn')
const GeneticAlgorithmConstructor = require('geneticalgorithm')
var { bigCombination } = require('js-combinatorics')

const randomNet = () => {
    const net = nn({ iterations: 100 })

    net.train([
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [1, 0, 0, 0, 0, 0, 0] },
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 1, 0, 0, 0, 0, 0] },
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 1, 0, 0, 0, 0] },
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 1, 0, 0, 0] },
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 0, 1, 0, 0] },
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 0, 0, 1, 0] },
        { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 0, 0, 0, 1] },
    ])

    return net
}

const net = randomNet()

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const getInput = turn => {
    return new Promise(resolve => {
        readline.question(`${turn}'s `, input => {
            resolve(+input - 1)
        })
    })
}

const print = board => {
    for (let index = board.length - 1; index >= 0; index--) {
        const x = board[index]
        console.log(x.join(' '))
    }
    console.log(Array.from({ length: 7 }, (_, i) => i + 1).join(' '))
}

const drop = (col, board, turn) => {
    for (let row = 0; row < board.length; row++) {
        const empty = board[row][col] === '-'
        if (empty) {
            board[row][col] = turn
            return
        }
    }
}

const checkWin = (board, turn) => {
    const width = 7
    const height = 6

    for (let col = 0; col < width - 3; col++) {
        for (let row = 0; row < height; row++) {
            const diag = [board[row][col + 0], board[row][col + 1], board[row][col + 2], board[row][col + 3]]
            const hasO = diag.includes(turn === 'o' ? 'x' : 'o')
            const hasD = diag.includes('-')

            if (!hasO && !hasD) return true
        }
    }

    for (let col = 0; col < width; col++) {
        let count = 0
        for (let row = 0; row < height; row++) {
            const x = board[row][col]
            if (x === turn) {
                count++
                if (count === 4) return true
            } else {
                count = 0
            }
        }
    }

    for (let col = 0; col < width - 3; col++) {
        for (let row = 0; row < height - 3; row++) {
            const diag = [board[row + 0][col + 0], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]]
            const hasO = diag.includes(turn === 'o' ? 'x' : 'o')
            const hasD = diag.includes('-')

            if (!hasO && !hasD) return true
        }
    }

    for (let col = 0; col < width - 3; col++) {
        for (let row = 0; row < height - 3; row++) {
            const diag = [board[row + 3][col + 0], board[row + 2][col + 1], board[row + 1][col + 2], board[row + 0][col + 3]]
            const hasO = diag.includes(turn === 'o' ? 'x' : 'o')
            const hasD = diag.includes('-')

            if (!hasO && !hasD) return true
        }
    }
}

const checkDraw = board => {
    return !board[5].some(x => x === '-')
}

const width = { length: 7 }
const height = { length: 6 }

const boardToInput = board => {
    const arr = board.flatMap(x => x).map(cell => {
        if (cell === 'x') return 1
        if (cell === '-') return 0
        if (cell === 'o') return -1
    })

    return arr
}

const getNNInput = (board, net) => {
    const actions = net.send(boardToInput(board))
    const orderedActions = Object.entries(actions).sort(([, numA], [, numB]) => numA < numB ? 1 : -1).map(([i]) => Number.parseInt(i))
    
    do {
        const action = orderedActions.pop()
        if (board[5][action] === '-') return action
    } while(true)
}

const run = async ({ a, b, vsAI, AIvsAI }) => {
    let board = Array.from(height, () => Array.from(width, () => '-'))

    // print(board)

    let turn = 'x'

    do {
        let input
        if (AIvsAI) {
            input = turn === 'o' ? getNNInput(board, a) : getNNInput(board, b)
        } else if (vsAI) {
            input = turn === 'o' ? getNNInput(board, net) : await getInput(turn)
        }
        // console.log(input)
        drop(input, board, turn)
        // print(board)
        const win = checkWin(board, turn)
        if (win) {
            // console.log(turn + ' WINS \n')
            return turn
        }
        const draw = checkDraw(board)
        if (draw) {
            // console.log('DRAW \n')
            return 'draw'
        }
        turn = turn === 'x' ? 'o' : 'x'
    } while (true)
}

const mutationFunction = (genome) => {
    const randomGeneIndex = Math.floor(Math.random() * genome.length)
    genome[randomGeneIndex] = Math.random() * 2 - 1
    return genome
}

const crossoverFunction = (a, b) => {
    const newA = []
    const newB = []
    a.map((geneA, i) => {
        if (Math.random() < 0.5) {
            newA.push(geneA)
            newB.push(b[i])
            return
        }
        newA.push(b[i])
        newB.push(geneA)
    })
    return [newA, newB]
}

const start = async () => {
    const population = 100

    const generation = Array.from({ length: population }, () => randomNet())

    const matches = generation.reduce((a, x, i) => {
        if (i % 2 === 0)
            a.push(generation.slice(i, i + 2));
        return a;
    }, [])
    const outcome = matches.map(([a, b]) => run({ a, b, AIvsAI: true }) === 'x' ? a : b )

    const outcomes = await Promise.all(outcome)

    
}

start()

const networkToGenome = ({ weights, biases }) => [...weights[1].flatMap(x => x), ...weights[2].flatMap(x => x), ...biases[1], ...biases[2]]

const gemoneToNetwork = arr => {
    const weights = []

    weights[1] = [
        arr.splice(0, 42),
        arr.splice(0, 42),
        arr.splice(0, 42)
    ]

    weights[2] = Array.from({ length: 7 }, (_, i) => arr.splice(0, 3))

    const biases = []
    biases[1] = arr.splice(0, 3)
    biases[2] = arr.splice(0, 7)

    return { weights, biases }
}

const genome = networkToGenome(net)

const newNN = gemoneToNetwork(genome)

// readline.close()
