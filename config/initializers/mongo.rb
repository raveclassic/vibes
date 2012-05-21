# MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
# MongoMapper.database = "#myapp-#{Rails.env}"

MongoMapper.connection = Mongo::Connection.new('ds033217.mongolab.com', 33217)
MongoMapper.database = "heroku_app4757825"

if defined?(PhusionPassenger)
   PhusionPassenger.on_event(:starting_worker_process) do |forked|
     MongoMapper.connection.connect if forked
   end
end