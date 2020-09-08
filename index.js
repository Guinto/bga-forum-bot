const request = require('request');
require('dotenv').config()

const client_id = process.env.CLIENT_ID
const access_token = process.env.ACCESS_TOKEN

function createPost(callback) {
    var postData = {}

    var today = new Date()
    if (today.getDay() == 0) { // Sunday: Strategy
        postData = {
            post_title: "Let's talk strategy",
            post_description: "This is an automated weekly post to talk about strategy. Did you learn something new, see a good video, or want to up your game?"
        }
        //callback(postData)
    }
    else if (today.getDay() == 1) { // Monday: What did you play?
        postData = {
            post_title: "What did you play this week? (" + (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear() + ")",
            post_description: "(" + (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear() + ") This is an automated weekly post to talk about the games you played last week."
        }
        callback(postData)
    }
    else if (today.getDay() == 2) { // Tuesday: Two Player
        postData = {
            post_title: "Two Player Tuesday",
            post_description: "This is an automated weekly post to talk about the two player games. Do you have a gameplay story, a favorite game, or want recommendations?"
        }
        //callback(postData)
    }
    else if (today.getDay() == 3) { // Wednesday: Game Recommendations
        postData = {
            post_title: "Recommend a Game",
            post_description: "This is an automated weekly post to talk about the game recommendations. Describe the type of game you're looking for, a little bit of what you like, or give recommendations to others."
        }
        //callback(postData)
    }
    else if (today.getDay() == 4) { // Thursday: Game Trade
        postData = {
            post_title: "Game Trade Thursday",
            post_description: "Comment with a list of games your want and/or a list of games you would be open to trade away and add in your location like City/State so anyone interested in a local swap can do that. If you're interested in starting a trade, either reply or DM to figure out the details. Make sure to update the comment after the deal is done."
        }
        //callback(postData)
    }
    else if (today.getDay() == 5) { // Friday: Kickstarter Discussion
        var options = {
            url: 'https://www.boardgameatlas.com/api/search?kickstarter=true&limit=10&order_by=percent_funded&gt_goal=5000&client_id=' + client_id,
        }
        
        request(options, function (error, response, body) {
            var json = JSON.parse(body)

            var weekAway = new Date()
            weekAway.setDate(weekAway.getDate() + 7)

            var finalWeekList = json.games.filter(e => new Date(e.kickstarter_deadline) < weekAway).sort(function(a, b) {
                if (b.kickstarter_goal < 5000) return 1
                return b.kickstarter_percent - a.kickstarter_percent
            })

            var gameListHtml = '<ul>'
            
            finalWeekList.map(e => {
                var html = '<li>'
                html += '<a href="/search/game/' + e.id + '">' + e.name + '</a> $' + e.kickstarter_pledge.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' / $' + e.kickstarter_goal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                html += '</li>'
                gameListHtml += html
            })

            gameListHtml += '</ul>'
            
            postData = {
                post_title: "Top Kickstarters Ending Soon! (" + (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear() + ")",
                post_description: "<p>This is an automated weekly post (" + (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear() + ") to talk about the games that are ending soon.</p>" + gameListHtml,
                game_list: finalWeekList.map(e => e.id).join(',')
            }
            callback(postData)
        })
    }
    else if (today.getDay() == 6) { // Saturday: Best Content
        postData = {
            post_title: "Best Video, Article, or Podcast",
            post_description: "This is an automated weekly post to talk about the best content you saw this week. It can be video, article, podcast, or any other form of content."
        }
        //callback(postData)
    }
}

createPost(function(postData) {
    var options = {
        url: 'https://www.boardgameatlas.com/api/forum/post/new?client_id=' + client_id,
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        json: postData
    }
    
    request.post(options, function (error, response, body) {
        if (error) console.log(error)
        console.log(response.statusCode)
    });
})