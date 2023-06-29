
# Forte.Optimizely.ContentUsage

Forte.Optimizely.ContentUsage is a small shell module for Optimizely CMS 12.

It lists the available content types and its instances (blocks or pages), published throughout the website.

## How to use?

To make it work in your CMS 12 web app:
1. Install the `Forte.Optimizely.ContentUsage` NuGet
2. Add `services.AddContentUsage();` where you register services

---

## Foundation 

For demo purposes the solution uses [Foundation](https://github.com/episerver/Foundation).
Foundation project consumes Forte.Optimizely.ContentUsage as a Nuget package.

---

## Prerequisites

You will need these to run locally on your machine.

[Net 6](https://dotnet.microsoft.com/download/dotnet/6.0)

[Node JS](https://nodejs.org/en/download/)

[Sql Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

---

## CMS access

Demo CMS project has a default username and password of `admin@example.com` / `Episerver123!`

---

## Installation

### Windows

Open command prompt as administrator

```
git clone https://github.com/fortedigital/EpiContentUsage.git
cd EpiContentUsage/src/Forte.Optimizely.ContentUsage
dotnet build Forte.Optimizely.ContentUsage.csproj
yarn install
yarn build
dotnet pack Forte.Optimizely.ContentUsage.csproj
cd ../../
setup.cmd 
dotnet run --project src/Foundation/Foundation.csproj
```

---

### View the site

After completing the setup steps and running the solution, access the site at <a href="http://localhost:5000">http://localhost:5000</a>.

To change the default port, modify the file <a href="https://github.com/fortedigital/EpiContentUsage/blob/master/src/Foundation/Properties/launchSettings.json">/src/Foundation/Properties/launchSettings.json</a>.

---