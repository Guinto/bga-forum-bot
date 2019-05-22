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
            post_title: "What did you play this week?",
            post_description: "This is an automated weekly post to talk about the games you played last week."
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
        callback(postData)
    }
    else if (today.getDay() == 4) { // Thursday: Game of the Week
        var options = {
            url: 'https://www.boardgameatlas.com/api/search?name=&limit=100&client_id=' + client_id,
        }
        
        request(options, function (error, response, body) {
            if (error) console.log(error)

            var json = JSON.parse(body)
            var game = json.games[Math.floor(Math.random() * 100)];

            postData = {
                post_title: "Game of the Week (" + game.name + ")",
                post_description: "This is an automated weekly post to talk about the game of the week. It chooses a random game from the top 100 on the popularity charts to hopefully get the most discussion from people who've played it. What do you think about " + game.name + ". Do you like it, own it, play it all the time, dislike, best strategies, or anything related to it?",
                game_list: game.id
            }
            //callback(postData)
        })
    }
    else if (today.getDay() == 5) { // Friday: Kickstarter Discussion
        var options = {
            url: 'https://www.boardgameatlas.com/api/search?kickstarter=true&limit=100&order_by=deadline&client_id=' + client_id,
        }
        
        request(options, function (error, response, body) {
            var json = JSON.parse(body)

            var today = new Date()
            var weekAway = new Date()
            weekAway.setDate(weekAway.getDate() + 7)
            var todayString = (today.getMonth() + 1) + "/" + today.getDate()
            var weekAwayString = (weekAway.getMonth() + 1) + "/" + weekAway.getDate()

            var finalWeekList = json.games.filter(e => new Date(e.kickstarter_deadline) < weekAway).sort(function(a, b) {
                if (b.kickstarter_goal < 5000) return -1
                return b.kickstarter_percent - a.kickstarter_percent
            })

            var gameListHtml = '<ul>'
            
            finalWeekList.map(e => {
                var html = '<li>'
                html += '<a href="/search/game/' + e.id + '">' + e.name + '</a> ' + e.kickstarter_percent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '% of $' + e.kickstarter_goal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                html += '</li>'
                gameListHtml += html
            })

            gameListHtml += '</ul>'
            
            postData = {
                post_title: "Kickstarter Ending (" + todayString + ' - ' + weekAwayString + ")",
                post_description: "<p>This is an automated weekly post to talk about the games that came out on kickstarter this past week.</p>" + gameListHtml,
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