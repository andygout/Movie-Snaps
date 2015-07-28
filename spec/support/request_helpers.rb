require 'spec_helper'
include Warden::Test::Helpers

def create_logged_in_user
  user = User.create! :name => 'John Doe', :email => 'john1@gmail.com', :password => 'topsecret', :password_confirmation => 'topsecret'
  login(user)
  user
end

def login(user)
  login_as user, scope: :user
end

def create_visit
  user = create_logged_in_user
  movie = Movie.create(name:"The Da Vinci Code (2006)",imdbID:"tt0382625")
  location = Location.create(user_id: user.id,name:"", description:"Da Vinci Code", latitude:48.860000000000000000,longitude:2.341111100000034600,address:"Louvre Pyramid, 75001, Paris, France")
  scene = Scene.create(movie_id: movie.id,location_id: location.id, image_file_name:"http://bit.ly/1JBfXCZ")
  visit = Visit.create(date_visited:"Fri, 03 Jul 1066",scene_id: scene.id,user_id: user.id, description: 'This was filmed here')
  Photo.create(caption:"Outside Le Louvre!",image_file_name:"Da%2520vinci%2520code%2520 %2520the%2520pyramid%2520louvre%2520 %2520fan%2520photo zpsgixesmtr",visit_id: visit.id)
  visit '/'
end

def fill_autocomplete(field, options = {})
  fill_in field, with: options[:with]
  sleep 5
  page.execute_script %Q{ $('##{field}').trigger('keydown') }
  selector = %Q{ul.ui-autocomplete li.ui-menu-item a:contains("#{options[:select]}")}
  page.execute_script %Q{ $('#{selector}').trigger('mouseenter').click() }
end
