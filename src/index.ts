enum VIEWS {
    START_VIEW = 'startView',
    CHOOSE_PLAYER_VIEW = 'choosePlayerView',
    GAME_SCORE = 'gameScore',
    VIEW_WINNER = 'winnerView',
}

enum PLAYERS {
    X = 'X' ,
    O = 'O'
}

enum MODE {
    ONE = 1,
    TWO = 2,
}

enum WRAPPERS {
    MAIN = 'main',
    GAME_BORDER = 'gameBorder',
    GAME_CONTAINER = 'gameContainer',
}

type Properties = {
    selector: string;
    eventType: string;
    isArrayOfElements?: boolean,
    callback: Function
}[]

type SelectorsType = {
    main: () => HTMLElement,
    gameBorder: () => HTMLElement,
    gameScore: () => HTMLElement,
    gameContainer: () => HTMLElement,
}

type UITypeProperty = { id: VIEWS; html: string, wrapper: WRAPPERS; props: Properties };

type UIType = {
    startView : UITypeProperty,
    choosePlayerView : UITypeProperty,
    gameScore : UITypeProperty,
}

type TPlayer = { score: number; type: PLAYERS };

const selectors: SelectorsType = {
    main: () => document.querySelector('.main') as HTMLElement,
    gameBorder: () => document.querySelector('.game-border') as HTMLElement,
    gameScore: () => document.querySelector('.game-score') as HTMLElement,
    gameContainer: () =>  document.querySelector('#game__container') as HTMLElement,
};

const helpers = {
     checkInnerHtmlValue: (cell1:HTMLElement, cell2: HTMLElement, cell3: HTMLElement) =>
        cell1.innerHTML !== "" &&
        cell1.innerHTML === cell2.innerHTML &&
        cell1.innerHTML === cell3.innerHTML,

     newStyle: (key: string, val: number | string) => ({ key, val: typeof val === 'number' ? `${val}px` : val }),

     noWinnerExist: () => ({ winner: undefined, styles: [] }),

     isEmpty: (x: string) => x === '',

     setVal: (val: PLAYERS, currentCell: Element) => currentCell.innerHTML = val,

     getTurn: (prevVal: PLAYERS): PLAYERS => prevVal === PLAYERS.X ? PLAYERS.O : PLAYERS.X,

    increaseScore: (player1: TPlayer, player2: TPlayer, turnOf: undefined | PLAYERS) =>
        player1.type === turnOf ? player1.score++ : player2.score++,

    setOpacityStyle: (el: HTMLElement) => {
        el.style.opacity = '0.6';
        return Promise.resolve(el);
    },

    applyStyledBorder: (el: HTMLElement, styles: any[]) => {
        styles.forEach(({ key, val: value } : { key: string; val: string }) => {
            el.style[key as keyof {}] = value;
        });
    },
    playWithComputer: (playMode: MODE, cells: HTMLElement[], turn: PLAYERS, game: { count: number; turnOf: PLAYERS | undefined; winner: PLAYERS | undefined }, setGame: Function) => {
        if (playMode === 1) {
            const {
                setVal,
                getTurn,
            } = helpers;

            setTimeout(() => {
                const suggestions = [0,2,6,8];
                const emptyCells: any[] = [];

                cells.forEach((c, i) => {
                    if(c.innerHTML === "") {
                        emptyCells.push(i);
                    }
                });

                const [cell] = [...suggestions.filter((p: number) => {
                    if(new RegExp(emptyCells.join('|')).test(p.toString()))  {
                        const c = emptyCells.indexOf(p);
                        if (c > -1)  emptyCells.splice(c, 1);
                        return true;
                    }
                    return  false;
                }), ...emptyCells];

                const  currentValue = getTurn(turn);

                if (!(() => game.winner)()) setVal(currentValue, cells[cell]);
                setGame({turnOf: getTurn(currentValue), count: game.count + 1, winner: (() => game.winner)() });
            }, 500);
        }
    }
}

type Theme = 'LIGHT' | 'DARK';

const setTheme = (() => {
    let theme: Theme = 'LIGHT'
    const setBackground = (el: HTMLElement, bg: string) => {
        if(el) {
            el.style.background = bg;
        }
    }
     return (change: boolean = false) => {
        if (change) {
            theme = theme === 'LIGHT' ? 'DARK' : 'LIGHT'
        }

        if(theme === 'DARK') {
            (document.querySelector('#theme') as HTMLElement).style.color = 'white';

            setBackground(document.querySelector('body') as HTMLElement,
                'linear-gradient(90deg, #3c4046, #2d2c32)');

            setBackground(document.querySelector('.game-border') as HTMLElement,
                'rgb(177 147 120)');

            setBackground(document.querySelector('#game__container') as HTMLElement,
                'rgba(40, 40, 40, 1) -webkit-radial-gradient(center, rgb(61 70 71), rgb(44 46 45))');

            setBackground(document.querySelector('.winner__container') as HTMLElement,
                'rgb(43 46 46 / 90%)');
        }

         if(theme === 'LIGHT') {
             (document.querySelector('#theme') as HTMLElement).style.color = 'black';

             setBackground(document.querySelector('body') as HTMLElement,
                 'linear-gradient(90deg, #f7f7f7, #ebebeb)');

             setBackground(document.querySelector('.game-border') as HTMLElement,
                 'rgb(215, 184, 148)');

             setBackground(document.querySelector('#game__container') as HTMLElement,
                 'rgba(40, 40, 40, 1) -webkit-radial-gradient(center, rgb(24, 42, 44), rgb(20, 63, 47))');

             setBackground(document.querySelector('.winner__container') as HTMLElement,
                 'rgba(16, 31, 31, 0.9)');
         }
    };
})();

const ticTacToe = () => {
    let view: VIEWS = VIEWS.START_VIEW;
    let playMode: MODE;

    let player1: TPlayer = {
        score: 0,
        type: PLAYERS.X
    };
    let player2: TPlayer = {
        score: 0,
        type: PLAYERS.O
    };

    let game: { count: number; turnOf: undefined | PLAYERS, winner: undefined | PLAYERS } = {
        count: 0,
        turnOf: undefined,
        winner: undefined,
    };

    const getView: Function = () => view;

    const setView: Function = (nextView: VIEWS): void => {
        view = nextView;
    }

    const setGame: Function = ({ turnOf, count, winner } : { turnOf: PLAYERS, count: number, winner: PLAYERS }): void => {
        game.count = count;
        game.turnOf = turnOf;
        game.winner = winner;
    }

    const clearAndSetNextView = (nextView: string, viewToClear: string, render: Function): void => {
        clearView(viewToClear);
        setView(nextView);
            
        render();
    }



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
                    callback: (render: Function) => () => {
                        playMode = MODE.ONE;
                        clearAndSetNextView(VIEWS.CHOOSE_PLAYER_VIEW, '#game__container', render);

                    },
                },
                {
                    selector: "#two",
                    eventType: 'click',
                    callback: (render: Function) => () => {
                        playMode = MODE.TWO;
                        clearAndSetNextView(VIEWS.CHOOSE_PLAYER_VIEW, '#game__container', render)
                    },
                }
            ]
        }),
        choosePlayerView: ({
            id: VIEWS.CHOOSE_PLAYER_VIEW,
            html: (isTwoPlayer: boolean = false) => `
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
                    callback: (render: Function) => () => {
                        player1.type = PLAYERS.X;
                        player2.type = PLAYERS.O;
                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                    },
                },
                {
                    selector: "#oBtn",
                    eventType: 'click',
                    callback:  (render: Function) => () => {
                        player1.type = PLAYERS.O;
                        player2.type = PLAYERS.X;
                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                    },
                },
                {
                    selector: "#prev",
                    eventType: 'click',
                    callback:  (render: Function) => () => clearAndSetNextView(VIEWS.START_VIEW, '#game__container', render),
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
                      `
            },
            wrapper: WRAPPERS.GAME_BORDER,
            props: [
                {
                    selector: ".reset-all",
                    eventType: 'click',
                    callback: (render: Function) => () => {
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
                    callback: (render: Function) => (e: Event, index: number, cells: HTMLElement[]) => {
                            const currentCell = (e.currentTarget as Element);
                            let { turnOf, count, winner } = game;
                            if (count === 9 || winner) return;

                            const {
                                isEmpty,
                                setVal,
                                getTurn,
                                increaseScore,
                                setOpacityStyle,
                                applyStyledBorder,
                                playWithComputer,
                            } = helpers;

                            if (isEmpty(currentCell.innerHTML)) {
                                let turn = turnOf === undefined ? player1.type : turnOf;
                                setVal(turn, currentCell);
                                setGame({turnOf: getTurn(turn), count: count + 1});

                                playWithComputer(playMode, cells, turn, game, setGame)

                                if (count >= 4) {
                                    const { winner, styles} = checkWinner(cells);

                                    if (winner) {
                                        increaseScore(player1, player2, turnOf);
                                        setGame({count: 0, turnOf: player1.type, winner });

                                        setTimeout(() => {
                                            const line = document.querySelector(".winner-line") as HTMLElement;
                                            setOpacityStyle(line).then(el => applyStyledBorder(el, styles));
                                        }, 100);

                                        setTimeout(() => {
                                            clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                                            clearAndSetNextView(VIEWS.VIEW_WINNER, '#game__container', render)
                                        }, 1000);
                                    } else {
                                        if (count === 8) {
                                            setTimeout(() => {
                                                clearAndSetNextView(VIEWS.VIEW_WINNER, '#game__container', render)
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
                                ${
                                    (() => game.winner)() === undefined 
                                        ? 'No winner :(' 
                                        : 'the winner is Player' 
                                }
                                 <strong>${
                                            (() => game.winner)() === undefined 
                                                ? '' 
                                                : ((() => game.winner)() + ' :D !!') 
                                         }
                                 </strong>
                             </span>
                            <div id="restart">Replay</div>
                        </div>`,
            wrapper: WRAPPERS.GAME_CONTAINER,
            props: [
                {
                    selector: "#restart",
                    eventType: 'click',
                    callback: (render: Function) => () => {
                        clearAndSetNextView(VIEWS.GAME_SCORE, '#game__container', render);
                    },
                }
            ]
        })
    };

    const clearView = (selector: string) => {
        (document.querySelector(selector)!.innerHTML = "");
    }

    const checkWinner = (cells: HTMLElement[]): { winner: string | undefined; styles : any[] }  => {
        const { checkInnerHtmlValue, newStyle, noWinnerExist } = helpers;
        let styles: any[];
        // check rows
        for (let i = 0; i < 9; i += 3) {
            if (checkInnerHtmlValue(cells[i], cells[i + 1],  cells[i + 2]) ) {

                if(i === 0) styles = [ newStyle('top', 105), newStyle('transform','rotate(0deg)')];
                if(i === 3) styles = [ newStyle('top', 'unset'), newStyle('transform','rotate(0deg)')];
                if(i === 6) styles = [ newStyle('top', 310), newStyle('transform','rotate(0deg)')];

                  // @ts-ignore
                return { winner: cells[i].innerHTML, styles };
            }
        }

        // check columns
        for (let i = 0; i < 3; i++) {
            if (checkInnerHtmlValue(cells[i], cells[i + 3],  cells[i + 6]) ) {

                if(i === 0) styles =  [ newStyle('width', 330), newStyle('left', -15), newStyle('transform', 'rotate(90deg)')];
                if(i === 1) styles =  [ newStyle('width', 330), newStyle('left', 85),  newStyle('transform', 'rotate(90deg)')];
                if(i === 2) styles =  [ newStyle('width', 330), newStyle('left', 185), newStyle('transform', 'rotate(90deg)')];
                // @ts-ignore
                return { winner: cells[i].innerHTML, styles };
            }
        }

        // check diagonals
        if (checkInnerHtmlValue(cells[0], cells[4],  cells[8]) ) {
            styles = [newStyle('transform','rotate(45deg)')];
            return  { winner: cells[0].innerHTML, styles };
        }

        if (checkInnerHtmlValue(cells[2], cells[4],  cells[6]) ) {
            styles = [newStyle('transform','rotate(134deg)')];
            return  { winner: cells[2].innerHTML, styles };
        }

        return noWinnerExist();
    };

    const generateUI = (
        getHtmlTemplate: Function,
        wrapper: HTMLElement,
        props: Properties,
        renderFunction: Function,
    ) => {

        const attachHtml = (wrapperHtml: HTMLElement, html: string) => {
            wrapperHtml.innerHTML = html;
        };

        const getElement = (selector: string): HTMLElement => {
            return document.querySelector(selector) as HTMLElement;
        };

        const getElementsAsArray = (selector: string): HTMLElement[] => {
            return Array.from(document.querySelectorAll(selector));
        };

        const attachEvent = (selector: string, eventType: string, callback: Function, isArrayOfElements: boolean) => {
            if(isArrayOfElements) {
                const elements = getElementsAsArray(selector);
                if (elements) elements.forEach(function(el: HTMLElement, index: number) {
                    el.addEventListener(eventType,function(e) {
                        callback(renderFunction).call(el, e, index, elements);
                    });
                });

            } else {
                const element = getElement(selector);
                if (element) element.addEventListener(eventType, callback(renderFunction));
            }
        };

        const attachEvents = (properties: Properties) =>
            properties.forEach(({ isArrayOfElements = false, selector, eventType, callback }) =>
                attachEvent(selector, eventType, callback, isArrayOfElements));

        const renderToDOM = (renderHTML: Function, setEventsHandler: Function) =>
            (args: Properties, wrapperHtml: HTMLElement, html: string) => {
             renderHTML(wrapperHtml, html);
             setTimeout(() =>  Promise.resolve(setEventsHandler(args)).then(() => setTheme()), 0);
        };

        renderToDOM(attachHtml, attachEvents)(props, wrapper, getHtmlTemplate());
    }

    return {
        UI,
        getView,
        generateUI,
    }
}

{
    const { UI, generateUI, getView } = ticTacToe();

    const render = () => {
        const { html, wrapper, props } = UI[getView() as keyof UIType];
        generateUI(html, selectors[wrapper as keyof SelectorsType](), props, render);
        setTimeout(() => {
            const themeButton = document.querySelector('#theme') as HTMLElement;
            if(themeButton) themeButton.addEventListener('click', () => setTheme(true));
        }, 100);
    };
    render();
}
