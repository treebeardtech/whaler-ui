require('dotenv').config()

module.exports = {
  siteMetadata: {
    title: 'Treebeard Technologies',
    description: 'a',
    url: 'https://treebeard.io',
    image: '/Treebeard.jpg',
  },
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-tslint',
    'gatsby-plugin-styled-components',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Treebeard`,
        short_name: `Treebeard`,
        start_url: `/`,
        // background_color: `#f7f0eb`,
        // theme_color: `#a2466c`,
        display: `standalone`,
        icon: 'src/assets/logo.png',
      },
    },
  ]
}
