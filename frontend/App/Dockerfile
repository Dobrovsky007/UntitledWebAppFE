FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Angular app
COPY ./dist/App/browser /usr/share/nginx/html