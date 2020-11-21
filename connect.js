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
    board.map(row => {
        let count = 0

        row.map(x => {
            if (x === turn) {
                count++
                if (count === 4) return true
            } else {
                count = 0
            }
        })
    })

    const width = 7
    const height = 6

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

const width = { length: 7 }
const height = { length: 6 }

const run = async () => {
    let board = Array.from(height, () => Array.from(width, () => '-'))

    print(board)

    let turn = 'x'

    do {
        const input = await getInput(turn)
        drop(input, board, turn)
        print(board)
        const win = checkWin(board, turn)
        if (win) console.log(turn + ' wins')
        turn = turn === 'x' ? 'o' : 'x'
        if (win) return
    } while (true)
}

const start = async () => {
    do {
        await run()
    } while (true)
}

var nn = require('nn')

var net = nn({ iterations: 100 })

net.train([
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [1, 0, 0, 0, 0, 0, 0] },
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 1, 0, 0, 0, 0, 0] },
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 1, 0, 0, 0, 0] },
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 1, 0, 0, 0] },
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 0, 1, 0, 0] },
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 0, 0, 1, 0] },
    { input: Array.from({ length: 7 * 6 }, () => Math.random() * 2 - 1), output: [0, 0, 0, 0, 0, 0, 1] },
])

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

readline.close()
