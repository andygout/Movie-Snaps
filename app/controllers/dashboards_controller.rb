class DashboardsController < ApplicationController

  def index
    @visits = Visit.all.group(:date_visited).count.to_a.sort_by!{|k|k[0]}

    @scenes = Scene.includes(:movie)
    @scene_table_data =[]
    @scenes.each do | scene |
      movie_found = false
      @scene_table_data.each_with_index do |item, i|
        if item[0] == scene.movie.name
          @scene_table_data[i][1] +=1
          movie_found = true
        end
      end
      if !movie_found
        new_item =[]
        new_item[0] = scene.movie.name
        new_item[1] = 1
        @scene_table_data.push(new_item)
      end
    end

    @scene_table_data.sort_by!{|k|k[1]}.reverse!

    while @scene_table_data.length > 10
        @scene_table_data.pop
    end

    @visits2 = Visit.includes(:user).all
    @user_table_data =[]
    @visits2.each do | visit |
      user_found = false
      @user_table_data.each_with_index do |item, i|
        if item[0] == visit.user.name
          @user_table_data[i][1] +=1
          user_found = true
        end
      end
      if !user_found
        new_item =[]
        new_item[0] = visit.user.name
        new_item[1] = 1
        @user_table_data.push(new_item)
      end
    end

    regex = %r!, ([a-zA-Z ]+)$!
    @locations = Location.all
    @location_table_data =[]
    @locations.each do | location |
      if (location.address =~ regex )
        country = location.address[(location.address =~ regex )+2..-1]
        country = 'United Kingdom' if country == 'UK'
        location_found = false
        @location_table_data.each_with_index do |item, i|
          if item[0] == country
            @location_table_data[i][1] +=1
            location_found = true
          end
        end
        @location_table_data.push([country,1]) if !location_found
      end
   end
  end




end
