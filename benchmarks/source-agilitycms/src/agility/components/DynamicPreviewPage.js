const DynamicPreviewPage = ({ pageContext }) => {
    if(typeof window !== `undefined`){
        //look for and grab the `ContentID` query string
        const contentID = getParameterByName({ name: `ContentID`, url: window.location.href });
        const itemPath = pageContext.redirects[contentID];

        //matched item
        if(itemPath) {
            //i.e. `/posts/some-post-title`
            window.location = itemPath;
        } else {
            //unknown item, so redirect to the parent-page (assuming it is a listing page)
            //i.e. `/posts/some-post-title`
            let path = pageContext.redirects[Object.keys(pageContext.redirects)[0]];
            //i.e. `/posts/
            const parentPath = path.substring(0, path.lastIndexOf('/'));
            //i.e. `/posts/some-post-title`
            window.location = parentPath;
        }
    }
    //no render
    return null;
}

const getParameterByName = ({ name, url}) => {
    if (!url) url = window.location.href;
    name = name.replace(/[[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export default DynamicPreviewPage;