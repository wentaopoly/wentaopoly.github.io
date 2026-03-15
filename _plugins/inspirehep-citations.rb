require "active_support/all"
require "fileutils"
require 'net/http'
require 'json'
require 'uri'

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class InspireHEPCitationsTag < Liquid::Tag
    Citations = { }
    CACHE_DIR = ".jekyll-cache/citations/inspirehep"
    CACHE_TTL = 7.days.to_i

    def initialize(tag_name, params, tokens)
      super
      @recid = params.strip
    end

    def render(context)
      recid = context[@recid.strip]
      api_url = "https://inspirehep.net/api/literature/?fields=citation_count&q=recid:#{recid}"
      site_source = context.registers[:site].config["source"]

      begin
        # If the citation count has already been fetched, return it
        if InspireHEPCitationsTag::Citations[recid]
          return InspireHEPCitationsTag::Citations[recid]
        end

        cached_count = read_cached_citation(site_source, recid)
        if cached_count
          InspireHEPCitationsTag::Citations[recid] = cached_count
          return cached_count
        end

        # Fetch the citation count from the API
        uri = URI(api_url)
        response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 5) do |http|
          http.get(uri.request_uri).body
        end
        data = JSON.parse(response)

        # # Log the response for debugging
        # puts "API Response: #{data.inspect}"

        # Extract citation count from the JSON data
        citation_count = data["hits"]["hits"][0]["metadata"]["citation_count"].to_i

        # Format the citation count for readability
        citation_count = Helpers.number_to_human(citation_count, format: '%n%u', precision: 2, units: { thousand: 'K', million: 'M', billion: 'B' })
        write_cached_citation(site_source, recid, citation_count)

      rescue Exception => e
        # Handle any errors that may occur during fetching
        citation_count = read_cached_citation(site_source, recid, allow_stale: true) || "N/A"

        # Print the error message including the exception class and message
        puts "Error fetching citation count for #{recid}: #{e.class} - #{e.message}"
      end

      InspireHEPCitationsTag::Citations[recid] = citation_count
      return "#{citation_count}"
    end

    private

    def cache_path(site_source, recid)
      File.join(site_source, CACHE_DIR, "#{recid}.txt")
    end

    def read_cached_citation(site_source, recid, allow_stale: false)
      path = cache_path(site_source, recid)
      return nil unless File.exist?(path)
      return nil if !allow_stale && (Time.now - File.mtime(path) > CACHE_TTL)

      File.read(path).strip
    end

    def write_cached_citation(site_source, recid, value)
      path = cache_path(site_source, recid)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, value)
    end
  end
end

Liquid::Template.register_tag('inspirehep_citations', Jekyll::InspireHEPCitationsTag)
