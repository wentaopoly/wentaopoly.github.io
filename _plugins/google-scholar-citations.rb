require "active_support/all"
require "fileutils"
require 'nokogiri'
require 'open-uri'

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    Citations = { }
    CITED_BY_REGEX = /Cited by (\d+[,\d]*)/
    CACHE_DIR = ".jekyll-cache/citations/google-scholar"
    CACHE_TTL = 7.days.to_i

    def initialize(tag_name, params, tokens)
      super
      splitted = params.split(" ").map(&:strip)
      @scholar_id = splitted[0]
      @article_id = splitted[1]

      if @scholar_id.nil? || @scholar_id.empty?
        puts "Invalid scholar_id provided"
      end

      if @article_id.nil? || @article_id.empty?
        puts "Invalid article_id provided"
      end
    end

    def render(context)
      article_id = context[@article_id.strip]
      scholar_id = context[@scholar_id.strip]
      article_url = "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"
      site_source = context.registers[:site].config["source"]

      begin
          # If the citation count has already been fetched, return it
          if GoogleScholarCitationsTag::Citations[article_id]
            return GoogleScholarCitationsTag::Citations[article_id]
          end

          cached_count = read_cached_citation(site_source, article_id)
          if cached_count
            GoogleScholarCitationsTag::Citations[article_id] = cached_count
            return cached_count
          end

          # Fetch the article page
          doc = Nokogiri::HTML(
            URI.open(article_url, "User-Agent" => "Ruby/#{RUBY_VERSION}", open_timeout: 5, read_timeout: 5)
          )

          # Attempt to extract the "Cited by n" string from the meta tags
          citation_count = 0

          # Look for meta tags with "name" attribute set to "description"
          description_meta = doc.css('meta[name="description"]')
          og_description_meta = doc.css('meta[property="og:description"]')

          if !description_meta.empty?
            cited_by_text = description_meta[0]['content']
            matches = cited_by_text.match(CITED_BY_REGEX)

            if matches
              citation_count = matches[1].sub(",", "").to_i
            end

          elsif !og_description_meta.empty?
            cited_by_text = og_description_meta[0]['content']
            matches = cited_by_text.match(CITED_BY_REGEX)

            if matches
              citation_count = matches[1].sub(",", "").to_i
            end
          end

        citation_count = Helpers.number_to_human(citation_count, :format => '%n%u', :precision => 2, :units => { :thousand => 'K', :million => 'M', :billion => 'B' })
        write_cached_citation(site_source, article_id, citation_count)

      rescue Exception => e
        # Handle any errors that may occur during fetching
        citation_count = read_cached_citation(site_source, article_id, allow_stale: true) || "N/A"

        # Print the error message including the exception class and message
        puts "Error fetching citation count for #{article_id} in #{article_url}: #{e.class} - #{e.message}"
      end

      GoogleScholarCitationsTag::Citations[article_id] = citation_count
      return "#{citation_count}"
    end

    private

    def cache_path(site_source, article_id)
      File.join(site_source, CACHE_DIR, "#{article_id}.txt")
    end

    def read_cached_citation(site_source, article_id, allow_stale: false)
      path = cache_path(site_source, article_id)
      return nil unless File.exist?(path)
      return nil if !allow_stale && (Time.now - File.mtime(path) > CACHE_TTL)

      File.read(path).strip
    end

    def write_cached_citation(site_source, article_id, value)
      path = cache_path(site_source, article_id)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, value)
    end
  end
end

Liquid::Template.register_tag('google_scholar_citations', Jekyll::GoogleScholarCitationsTag)
