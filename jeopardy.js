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
const $spinner = $('<div>')
    .addClass('spinner')
    .html(
        '<div class="text"><img src="jeopardy-logo.png" /></div><div class="loader"></div>'
    );
const $table = $('<table>').attr('id', 'jeopardy');
const $play = $('<button>').addClass('play').text('Restart');
$('body').append($spinner, $table, $play);

const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const res = await axios.get('//jservice.io/api/categories', {
        params: {
            count: 50,
        },
    });

    // shuffle the data array via lodash, splice it down to 6 items, map it to just id
    // const cats = _.shuffle(res.data)
    //    .splice(0, 6)
    //    .map((cat) => cat.id);
    const cats = _.sampleSize(res.data, NUM_CATEGORIES).map((cat) => cat.id);
    //console.log('categories:', cats);
    return cats;
}

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
    const url = `//jservice.io/api/category?id=${catId}`;
    const res = await axios.get(url);
    //console.log('getCategory data:', res.data);
    const cluesOrig = _.sampleSize(res.data.clues, NUM_QUESTIONS_PER_CAT);
    const clues = cluesOrig.map((clue) => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
    }));
    //console.log(clues);
    //console.log(res.data.title);
    return { title: res.data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $table.html('');
    console.log('fillTable cats:', categories);
    const $thead = $('<thead>');
    const $tr = $('<tr>');
    // for (let cat = 0; cat < NUM_CATEGORIES; cat++) {
    //     const $td = $('<th>').text(categories[cat].title);
    //     $tr.append($td);
    //     //console.log(categories[cat].title);
    // }
    categories.forEach((cat) => {
        const $th = $('<th>').text(cat.title);
        $tr.append($th);
    });
    $thead.append($tr);
    //$('#jeopardy thead').append($tr);
    $table.append($thead);

    const $tbody = $('<tbody>');
    // 6 categories across, 5 questions down
    for (let clueIdx = 0; clueIdx < NUM_QUESTIONS_PER_CAT; clueIdx++) {
        const $tbodyTr = $('<tr>');
        for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
            const $td = $('<td>')
                .attr({
                    id: `${catIdx}-${clueIdx}`,
                    category: catIdx,
                    clue: clueIdx,
                })
                .html('<span>?</span>');
            // console.log(categories[catIdx].clues[clueIdx].question)
            //console.log('inner loop:', categories);
            $tbodyTr.append($td);
        }
        $tbody.append($tbodyTr);
    }
    $table.append($tbody);

    hideLoadingView();

    // This works, now lets build the tbody
}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const $thisTd = $(this);
    // stop answered from being clickable
    if ($thisTd.hasClass('answered')) {
        //console.log('already answered');
        return;
    }
    const id = this.id;
    let [catIdx, clueIdx] = id.split('-');
    // console.log('catIdx:', catIdx);
    // console.log('clueIdx:', clueIdx);
    let clue = categories[catIdx].clues[clueIdx];
    if (clue.showing === null) {
        // console.log('Currently: null, make it showing question.');
        // console.log('this in clue', this);
        // console.log('evt in clue', evt);
        $thisTd.html(clue.question);
        $thisTd.addClass('question');
        clue.showing = 'question';
    } else if (clue.showing === 'question') {
        $thisTd.html(clue.answer);
        clue.showing = 'answer';
        $thisTd.removeClass('question');
        $thisTd.addClass('answered');
    }
    //console.log(clue);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $spinner.fadeIn();
    //$('body').append($spinner);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $spinner.fadeOut();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    const catIds = await getCategoryIds();
    categories = [];
    //forEach wouldn't work here, weird.
    for (let id of catIds) {
        categories.push(await getCategory(id));
    }
    console.log('setup categories:', categories);

    fillTable();
}

/** On click of start / restart button, set up game. */

$($play).click(function () {
    setupAndStart();
});

/** On page load, add event handler for clicking clues */

// TODO
$(document).ready(function () {
    setupAndStart();
    // event delegation to specify the td's!
    $('table').on('click', 'td', handleClick);
});
