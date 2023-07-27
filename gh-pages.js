var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/mario-michelessa/PlausibleGeneration.git', // Update to point to your repository  
        user: {
            name: 'mario-michelessa', // update to use your name
            email: 'mario.michelessa@student-cs.fr' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)
