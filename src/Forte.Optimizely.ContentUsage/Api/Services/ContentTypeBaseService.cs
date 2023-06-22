﻿using System;
using System.Collections.Generic;
using EPiServer.Core;
using EPiServer.DataAbstraction;

namespace Forte.Optimizely.ContentUsage.Api.Services;

public class ContentTypeBaseService
{
    private static readonly IDictionary<ContentTypeBase, Type> _contentTypeBases = new Dictionary<ContentTypeBase, Type>
    {
        {
            ContentTypeBase.Page,
            typeof(PageData)
        },
        {
            ContentTypeBase.Block,
            typeof(BlockData)
        },
        {
            ContentTypeBase.Folder,
            typeof(ContentFolder)
        },
        {
            ContentTypeBase.Video,
            typeof(VideoData)
        },
        {
            ContentTypeBase.Image,
            typeof(ImageData)
        },
        {
            ContentTypeBase.Media,
            typeof(MediaData)
        }
    };

    public IEnumerable<ContentTypeBase> GetAll()
    {
        return _contentTypeBases.Keys;
    }
}