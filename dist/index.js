"use strict";
var VIEWS;
(function (VIEWS) {
    VIEWS["START_VIEW"] = "startView";
    VIEWS["CHOOSE_PLAYER_VIEW"] = "choosePlayerView";
    VIEWS["GAME_SCORE"] = "gameScore";
    VIEWS["VIEW_WINNER"] = "winnerView";
})(VIEWS || (VIEWS = {}));
var PLAYERS;
(function (PLAYERS) {
    PLAYERS["X"] = "X";
    PLAYERS["O"] = "O";
})(PLAYERS || (PLAYERS = {}));
var MODE;
(function (MODE) {
    MODE[MODE["ONE"] = 1] = "ONE";
    MODE[MODE["TWO"] = 2] = "TWO";
})(MODE || (MODE = {}));
var WRAPPERS;
(function (WRAPPERS) {
    WRAPPERS["MAIN"] = "main";
    WRAPPERS["GAME_BORDER"] = "gameBorder";
    WRAPPERS["GAME_CONTAINER"] = "gameContainer";
})(WRAPPERS || (WRAPPERS = {}));
const selectors = {
    main: () => document.querySelector('.main'),
    gameBorder: () => document.querySelector('.game-border'),
    gameScore: () => document.querySelector('.game-score'),
    gameContainer: () => document.querySelector('#game__container'),
};
const helpers = {
    checkInnerHtmlValue: (cell1, cell2, cell3) => cell1.innerHTML !== "" &&
        cell1.innerHTML === cell2.innerHTML &&
        cell1.innerHTML === cell3.innerHTML,
    newStyle: (key, val) => ({ key, val: typeof val === 'number' ? `${val}px` : val }),
    noWinnerExist: () => ({ winner: undefined, styles: [] }),
    isEmpty: (x) => x === '',
    setVal: (val, currentCell) => currentCell.innerHTML = val,
    getTurn: (prevVal) => prevVal === PLAYERS.X ? PLAYERS.O : PLAYERS.X,
    increaseScore: (player1, player2, turnOf) => player1.type === turnOf ? player1.score++ : player2.score++,
    setOpacityStyle: (el) => {
        el.style.opacity = '0.6';
        return Promise.resolve(el);
    },
    applyStyledBorder: (el, styles) => {
        styles.forEach(({ key, val: value }) => {
            el.style[key] = value;
        });
    },
    playWithComputer: (playMode, cells, turn, game, setGame) => {
        if (playMode === 1) {
            const { setVal, getTurn, } = helpers;
            setTimeout(() => {
                const suggestions = [0, 2, 6, 8];
                const emptyCells = [];
                cells.forEach((c, i) => {
                    if (c.innerHTML === "") {
                        emptyCells.push(i);
                    }
                });
                const [cell] = [...suggestions.filter((p) => {
                        if (new RegExp(emptyCells.join('|')).test(p.toString())) {
                            const c = emptyCells.indexOf(p);
                            if (c > -1)
                                emptyCells.splice(c, 1);
                            return true;
                        }
                        return false;
                    }), ...emptyCells];
                const currentValue = getTurn(turn);
                if (!(() => game.winner)())
                    setVal(currentValue, cells[cell]);
                setGame({ turnOf: getTurn(currentValue), count: game.count + 1, winner: (() => game.winner)() });
            }, 500);
        }
    }
};
const setTheme = (() => {
    let theme = 'LIGHT';
    const setBackground = (el, bg) => {
        if (el) {
            el.style.background = bg;
        }
    };
    return (change = false) => {
        if (change) {
            theme = theme === 'LIGHT' ? 'DARK' : 'LIGHT';
        }
        if (theme === 'DARK') {
            document.querySelector('#theme').style.color = 'white';
            setBackground(document.querySelector('body'), 'linear-gradient(90deg, #3c4046, #2d2c32)');
            setBackground(document.querySelector('.game-border'), 'rgb(177 147 120)');
            setBackground(document.querySelector('#game__container'), 'rgba(40, 40, 40, 1) -webkit-radial-gradient(center, rgb(61 70 71), rgb(44 46 45))');
            setBackground(document.querySelector('.winner__container'), 'rgb(43 46 46 / 90%)');
        }
        if (theme === 'LIGHT') {
            document.querySelector('#theme').style.color = 'black';
            setBackground(document.querySelector('body'), 'linear-gradient(90deg, #f7f7f7, #ebebeb)');
            setBackground(document.querySelector('.game-border'), 'rgb(215, 184, 148)');
            setBackground(document.querySelector('#game__container'), 'rgba(40, 40, 40, 1) -webkit-radial-gradient(center, rgb(24, 42, 44), rgb(20, 63, 47))');
            setBackground(document.querySelector('.winner__container'), 'rgba(16, 31, 31, 0.9)');
        }
    };
})();
const ticTacToe = () => {
    let view = VIEWS.START_VIEW;
    let playMode;
    let player1 = {
        score: 0,
        type: PLAYERS.X
    };
    let player2 = {
        score: 0,
        type: PLAYERS.O
    };
    let game = {
        count: 0,
        turnOf: undefined,
        winner: undefined,
    };
    const getView = () => view;
    const setView = (nextView) => {
        view = nextView;
    };
    const setGame = ({ turnOf, count, winner }) => {
        game.count = count;
        game.turnOf = turnOf;
        game.winner = winner;
    };
    const clearAndSetNextView = (nextView, viewToClear, render) => {
        clearView(viewToClear);
        setView(nextView);
        render();
    };
    const UI = {
        startView: ({
            id: VIEWS.START_VIEW,
            html: () => ` <h1 id="game-title">How do you want to play ?</h1>
                   <div class="game__container--players">
                   <span id="one">One Player</span>
                   <span id="two">Two Player</span>
               </div>`,
            wrapper: WRAPPERS.GAME_CONTAINER,
            props: [
                {
                    selector: "#one",
                    eventType: 'click',
                    callback: (render) => () => {
                        playMode = MODE.ONE;
                        clearAndSetNextView(VIEWS.CHOOSE_PLAYER_VIEW, '#game__container', render);
                    },
                },
                {
                    selector: "#two",
                    eventType: 'click',
                    callback: (render) => () => {
                        playMode = MODE.TWO;
                        clearAndSetNextView(VIEWS.CHOOSE_PLAYER_VIEW, '#game__container', render);
                    },
                }
            ]
        }),
        choosePlayerView: ({
            id: VIEWS.CHOOSE_PLAYER_VIEW,
            html: (isTwoPlayer = false) => `
                            <h1 id="game-title">
                                ${isTwoPlayer ? "Player 1: " : ""}
                                 Would you like to be X or O ?
                            </h1>
                            <div class="game__container--players">
                              <span id="xBtn">X</span>
                              <span id="oBtn">O</span>
                            </div>
                            <div id="prev"><- Back</div>
                            `,
            wrapper: WRAPPERS.GAME_CONTAINER,
            props: [
                {
                    selector: "#xBtn",
                    eventType: 'click',
                    callback: (render) => () => {
                        player1.type = PLAYERS.X;
                        player2.type = PLAYERS.O;
                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                    },
                },
                {
                    selector: "#oBtn",
                    eventType: 'click',
                    callback: (render) => () => {
                        player1.type = PLAYERS.O;
                        player2.type = PLAYERS.X;
                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                    },
                },
                {
                    selector: "#prev",
                    eventType: 'click',
                    callback: (render) => () => clearAndSetNextView(VIEWS.START_VIEW, '#game__container', render),
                }
            ]
        }),
        gameScore: ({
            html: () => {
                return `<div class="game-score">
                             <span >Player ${player1.type} : <strong id="p1">${(() => player1.score)()}</strong></span>
                             <span >Player ${player2.type} : <strong id="p2">${(() => player2.score)()}</strong></span>
                            <strong class="reset-all">Reset All</strong>
                       </div>
                       <div id="game__container"> 
                        <div class="winner-line"></div>
                        <table id="cells">
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </table>
                      </div> 
                      `;
            },
            wrapper: WRAPPERS.GAME_BORDER,
            props: [
                {
                    selector: ".reset-all",
                    eventType: 'click',
                    callback: (render) => () => {
                        selectors.gameScore().remove();
                        player1.score = 0;
                        player2.score = 0;
                        setGame({
                            count: 0,
                            turnOf: undefined,
                        });
                        clearAndSetNextView(VIEWS.START_VIEW, '#game__container', render);
                    },
                },
                {
                    selector: "#cells td",
                    eventType: 'click',
                    isArrayOfElements: true,
                    callback: (render) => (e, index, cells) => {
                        const currentCell = e.currentTarget;
                        let { turnOf, count, winner } = game;
                        if (count === 9 || winner)
                            return;
                        const { isEmpty, setVal, getTurn, increaseScore, setOpacityStyle, applyStyledBorder, playWithComputer, } = helpers;
                        if (isEmpty(currentCell.innerHTML)) {
                            let turn = turnOf === undefined ? player1.type : turnOf;
                            setVal(turn, currentCell);
                            setGame({ turnOf: getTurn(turn), count: count + 1 });
                            playWithComputer(playMode, cells, turn, game, setGame);
                            if (count >= 4) {
                                const { winner, styles } = checkWinner(cells);
                                if (winner) {
                                    increaseScore(player1, player2, turnOf);
                                    setGame({ count: 0, turnOf: player1.type, winner });
                                    setTimeout(() => {
                                        const line = document.querySelector(".winner-line");
                                        setOpacityStyle(line).then(el => applyStyledBorder(el, styles));
                                    }, 100);
                                    setTimeout(() => {
                                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                                        clearAndSetNextView(VIEWS.VIEW_WINNER, '#game__container', render);
                                    }, 1000);
                                }
                                else {
                                    if (count === 8) {
                                        setTimeout(() => {
                                            clearAndSetNextView(VIEWS.VIEW_WINNER, '#game__container', render);
                                        }, 500);
                                    }
                                }
                            }
                        }
                    },
                }
            ]
        }),
        winnerView: ({
            html: () => `<div class="winner__container">
                            <span id="winner--player">
                                ${(() => game.winner)() === undefined
                ? 'No winner :('
                : 'the winner is Player'}
                                 <strong>${(() => game.winner)() === undefined
                ? ''
                : ((() => game.winner)() + ' :D !!')}
                                 </strong>
                             </span>
                            <div id="restart">Replay</div>
                        </div>`,
            wrapper: WRAPPERS.GAME_CONTAINER,
            props: [
                {
                    selector: "#restart",
                    eventType: 'click',
                    callback: (render) => () => {
                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                    },
                }
            ]
        })
    };
    const clearView = (selector) => {
        (document.querySelector(selector).innerHTML = "");
    };
    const checkWinner = (cells) => {
        const { checkInnerHtmlValue, newStyle, noWinnerExist } = helpers;
        let styles;
        for (let i = 0; i < 9; i += 3) {
            if (checkInnerHtmlValue(cells[i], cells[i + 1], cells[i + 2])) {
                if (i === 0)
                    styles = [newStyle('top', 105), newStyle('transform', 'rotate(0deg)')];
                if (i === 3)
                    styles = [newStyle('top', 'unset'), newStyle('transform', 'rotate(0deg)')];
                if (i === 6)
                    styles = [newStyle('top', 310), newStyle('transform', 'rotate(0deg)')];
                return { winner: cells[i].innerHTML, styles };
            }
        }
        for (let i = 0; i < 3; i++) {
            if (checkInnerHtmlValue(cells[i], cells[i + 3], cells[i + 6])) {
                if (i === 0)
                    styles = [newStyle('width', 330), newStyle('left', -15), newStyle('transform', 'rotate(90deg)')];
                if (i === 1)
                    styles = [newStyle('width', 330), newStyle('left', 85), newStyle('transform', 'rotate(90deg)')];
                if (i === 2)
                    styles = [newStyle('width', 330), newStyle('left', 185), newStyle('transform', 'rotate(90deg)')];
                return { winner: cells[i].innerHTML, styles };
            }
        }
        if (checkInnerHtmlValue(cells[0], cells[4], cells[8])) {
            styles = [newStyle('transform', 'rotate(45deg)')];
            return { winner: cells[0].innerHTML, styles };
        }
        if (checkInnerHtmlValue(cells[2], cells[4], cells[6])) {
            styles = [newStyle('transform', 'rotate(134deg)')];
            return { winner: cells[2].innerHTML, styles };
        }
        return noWinnerExist();
    };
    const generateUI = (getHtmlTemplate, wrapper, props, renderFunction) => {
        const attachHtml = (wrapperHtml, html) => {
            wrapperHtml.innerHTML = html;
        };
        const getElement = (selector) => {
            return document.querySelector(selector);
        };
        const getElementsAsArray = (selector) => {
            return Array.from(document.querySelectorAll(selector));
        };
        const attachEvent = (selector, eventType, callback, isArrayOfElements) => {
            if (isArrayOfElements) {
                const elements = getElementsAsArray(selector);
                if (elements)
                    elements.forEach(function (el, index) {
                        el.addEventListener(eventType, function (e) {
                            callback(renderFunction).call(el, e, index, elements);
                        });
                    });
            }
            else {
                const element = getElement(selector);
                if (element)
                    element.addEventListener(eventType, callback(renderFunction));
            }
        };
        const attachEvents = (properties) => properties.forEach(({ isArrayOfElements = false, selector, eventType, callback }) => attachEvent(selector, eventType, callback, isArrayOfElements));
        const renderToDOM = (renderHTML, setEventsHandler) => (args, wrapperHtml, html) => {
            renderHTML(wrapperHtml, html);
            setTimeout(() => Promise.resolve(setEventsHandler(args)).then(() => setTheme()), 0);
        };
        renderToDOM(attachHtml, attachEvents)(props, wrapper, getHtmlTemplate());
    };
    return {
        UI,
        getView,
        generateUI,
    };
};
{
    const { UI, generateUI, getView } = ticTacToe();
    const render = () => {
        const { html, wrapper, props } = UI[getView()];
        generateUI(html, selectors[wrapper](), props, render);
        setTimeout(() => {
            const themeButton = document.querySelector('#theme');
            if (themeButton)
                themeButton.addEventListener('click', () => setTheme(true));
        }, 100);
    };
    render();
}
