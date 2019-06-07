import templateHTML from "./src/templates/main.html!text"
import mustache from 'mustache'
import axios from 'axios'
import _ from 'lodash'

const dataurl = 'https://interactive.guim.co.uk/docsdata-test/1blisaXnBVa7HdR6iq6hEEQJjQ2B8-hEsd6dH_WrPfS0.json'

async function parse(data) {

    data = _(data).groupBy('round').values()
    var rounds = {}
    data.forEach(r => {
        r.sort((a,b) => {
            return b.votes - a.votes;
        });
        var leader = r[0];
        r.map(c => {
            c.width = `${100 * (c.votes / leader.votes)}%`
            return c;
        })
        rounds[r[0].round] = r
        return r;
    })
    console.log(rounds)
    return rounds;

}


export async function render() {
    var rawdata = (await axios.get(dataurl)).data;
    var data = await parse(rawdata.sheets.Sheet1);
    var output = mustache.render(templateHTML,data)
    return output;
}