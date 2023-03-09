// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const res = await axios.get('http://jservice.io/api/categories', {
        params: {
            count: 50,
        },
    });

    // shuffle the data array via lodash, splice it down to 6 items, map it to just id
    // const cats = _.shuffle(res.data)
    //    .splice(0, 6)
    //    .map((cat) => cat.id);
    const cats = _.sampleSize(res.data, 6).map((cat) => cat.id);
    console.log('categories:', cats);
    return cats;
}
getCategoryIds();

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const url = `http://jservice.io/api/category?id=${catId}`;
    const res = await axios.get(url);
    console.log('getCategory data:', res.data);
    const cluesOrig = _.sampleSize(res.data.clues, 5);
    const clues = cluesOrig.map((clue) => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
    }));
    console.log(clues);
    console.log(res.data.title);
    return { title: res.data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const catIds = await getCategoryIds();
    categories = [];
    //forEach wouldn't work here, weird.
    for (let id of catIds) {
        categories.push(await getCategory(id));
    }
    console.log('setup categories:', categories);

    //fillTable();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
