import templateHTML from "./src/templates/main.html!text"
import mustache from 'mustache'
import axios from 'axios'
import _ from 'lodash'

const dataurl = 'https://interactive.guim.co.uk/docsdata-test/1blisaXnBVa7HdR6iq6hEEQJjQ2B8-hEsd6dH_WrPfS0.json';

async function getGlosses(rounds,data) {

    var glosses = data.rounds;

    rounds = rounds.map(r => {

        var matchinggloss = glosses.find(g => {
            return g.round == r.round
        })

        if (typeof matchinggloss != "undefined") {


            for (var prop in matchinggloss) {
                r[prop] = matchinggloss[prop]
            }

            return r;

        }
    })
    return rounds;
}

async function parse(data) {
    let votedata = _(data.votes).groupBy('round').values();
    let rounds = [];
    votedata.forEach(r => {
        r.sort((a,b) => {
            return b.votes - a.votes;
        });
        var leader = r[0];
        r.map(c => {
            c.width = `${100 * (c.votes / leader.votes)}%`
            return c;
        });
        var qualifiers = r.filter(c => c.statuscode == 'in');
        var eliminated = r.filter(c => c.statuscode == 'out');
        rounds.push({
            'round' : r[0].round,
            'results' : r,
            'qualifiers' : qualifiers,
            'eliminated' : eliminated
        });
        return r;
    });
    rounds = await getGlosses(rounds,data);
    console.log(rounds)

    return rounds;
};


export async function render() {
    var rawdata = (await axios.get(dataurl)).data;
    var data = await parse(rawdata.sheets);
    var output = mustache.render(templateHTML,data)
    return output;
}