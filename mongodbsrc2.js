use dashboarddb2
db.createUser(
    {
        user: "dashboarduser",
        pwd: "dbpassword",
        roles: [
            {role: "readWrite", db: "dashboarddb2"}
        ]
    })
db.dummmyCollection.insert({x: 1});
use dashboarddb_test1
db.createUser(
    {
        user: "dashboarduser",
        pwd: "dbpassword",
        roles: [
            {role: "readWrite", db: "dashboarddb2"},
            {role: "readWrite", db: "dashboarddb_test1"}
        ]
    })
