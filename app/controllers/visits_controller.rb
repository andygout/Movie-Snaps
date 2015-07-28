class VisitsController < ApplicationController

  def index
    @scenes = Scene.all
    @visits = Visit.all
  end

  def new
    @scene = Scene.find(params[:scene_id])
    @location = Location.find(@scene.location_id)
    @current_visits = Visit.where("scene_id = ?", params[:scene_id]).all
    @visit = Visit.new
    @movie = @scene.movie.name
    @photo = Photo.new
  end

  def create
    @visit = Visit.create(visit_params.merge({user:current_user}).merge({scene_id: params[:scene_id]}))
    @photo = Photo.create(photo_params.merge({visit_id: @visit.id}))
    redirect_to root_path
  end

  def visit_params
    params.require(:visit).permit![:visit]
  end

  def photo_params
    params.require(:visit).permit![:photo]
  end

end